import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const eventSchema = z.enum([
  "page_view",
  "sample_view",
  "sample_search",
  "service_view",
  "whatsapp_click",
  "phone_click",
  "enquiry_started",
  "enquiry_submitted",
  "chatbot_open",
  "chatbot_message",
  "chatbot_intent",
  "chatbot_redirect",
  "request_similar",
  "contact_form_submit",
]);

const metadataValue = z.union([
  z.string().max(500),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

const postSchema = z.object({
  event: eventSchema,
  path: z.string().max(500).startsWith("/").optional(),
  metadata: z.record(z.string().max(100), metadataValue).optional(),
});

function getStartDate(range: string) {
  const now = new Date();

  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (range === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  if (range === "90d") {
    return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }

  return new Date(0);
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, unknown>;
}

function getString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  return typeof value === "string" ? value : null;
}

/*
 * POST
 *
 * Public analytics event ingestion.
 */
export async function POST(request: Request) {
  try {
    const payload = postSchema.parse(await request.json());

    await prisma.analyticsEvent.create({
      data: {
        event: payload.event,
        path: payload.path,
        metadata: payload.metadata,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid analytics event.",
        },
        { status: 400 }
      );
    }

    console.error("Analytics event failed:", error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}

/*
 * GET
 *
 * Admin analytics dashboard data.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const rangeParam = searchParams.get("range") || "30d";

    const range =
      rangeParam === "7d" ||
      rangeParam === "30d" ||
      rangeParam === "90d" ||
      rangeParam === "all"
        ? rangeParam
        : "30d";

    const startDate = getStartDate(range);

    const events = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        event: true,
        path: true,
        metadata: true,
        sessionId: true,
        createdAt: true,
      },
    });

    const totalEvents = events.length;

    const countEvent = (eventName: string) =>
      events.filter((event) => event.event === eventName).length;

    /*
     * -----------------------------------------
     * Daily event trend
     * -----------------------------------------
     */

    const dailyMap = new Map<
      string,
      {
        date: string;
        events: number;
        pageViews: number;
        sampleViews: number;
        enquiries: number;
      }
    >();

    for (const event of events) {
      const date = getDateKey(event.createdAt);

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          events: 0,
          pageViews: 0,
          sampleViews: 0,
          enquiries: 0,
        });
      }

      const item = dailyMap.get(date)!;

      item.events += 1;

      if (event.event === "page_view") {
        item.pageViews += 1;
      }

      if (event.event === "sample_view") {
        item.sampleViews += 1;
      }

      if (event.event === "enquiry_submitted") {
        item.enquiries += 1;
      }
    }

    const daily = Array.from(dailyMap.values());

    /*
     * -----------------------------------------
     * Event breakdown
     * -----------------------------------------
     */

    const eventMap = new Map<string, number>();

    for (const event of events) {
      eventMap.set(event.event, (eventMap.get(event.event) || 0) + 1);
    }

    const eventBreakdown = Array.from(eventMap.entries())
      .map(([event, count]) => ({
        event,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    /*
     * -----------------------------------------
     * Top pages
     * -----------------------------------------
     */

    const pageMap = new Map<string, number>();

    for (const event of events) {
      if (event.event !== "page_view" || !event.path) {
        continue;
      }

      pageMap.set(event.path, (pageMap.get(event.path) || 0) + 1);
    }

    const topPages = Array.from(pageMap.entries())
      .map(([path, views]) => ({
        path,
        views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    /*
     * -----------------------------------------
     * Top samples
     * -----------------------------------------
     */

    const sampleMap = new Map<
      string,
      {
        id: string | null;
        title: string;
        views: number;
      }
    >();

    for (const event of events) {
      if (event.event !== "sample_view") {
        continue;
      }

      const metadata = parseMetadata(event.metadata);

      const id = getString(metadata, "sampleId");
      const title =
        getString(metadata, "title") ||
        getString(metadata, "sampleTitle") ||
        "Unknown sample";

      const key = id || title;

      if (!sampleMap.has(key)) {
        sampleMap.set(key, {
          id,
          title,
          views: 0,
        });
      }

      sampleMap.get(key)!.views += 1;
    }

    const topSamples = Array.from(sampleMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    /*
     * -----------------------------------------
     * Top services
     * -----------------------------------------
     */

    const serviceMap = new Map<
      string,
      {
        id: string | null;
        title: string;
        views: number;
      }
    >();

    for (const event of events) {
      if (event.event !== "service_view") {
        continue;
      }

      const metadata = parseMetadata(event.metadata);

      const id = getString(metadata, "serviceId");

      const title =
        getString(metadata, "title") ||
        getString(metadata, "serviceTitle") ||
        "Unknown service";

      const key = id || title;

      if (!serviceMap.has(key)) {
        serviceMap.set(key, {
          id,
          title,
          views: 0,
        });
      }

      serviceMap.get(key)!.views += 1;
    }

    const topServices = Array.from(serviceMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    /*
     * -----------------------------------------
     * Unique sessions
     * -----------------------------------------
     */

    const sessions = new Set(
      events.map((event) => event.sessionId).filter(Boolean)
    );

    /*
     * -----------------------------------------
     * Conversion indicators
     * -----------------------------------------
     */

    const pageViews = countEvent("page_view");
    const enquirySubmitted = countEvent("enquiry_submitted");

    const enquiryRate =
      pageViews > 0
        ? Number(((enquirySubmitted / pageViews) * 100).toFixed(2))
        : 0;

    return NextResponse.json({
      success: true,

      range,

      summary: {
        totalEvents,

        pageViews,

        sampleViews: countEvent("sample_view"),

        serviceViews: countEvent("service_view"),

        enquiries: enquirySubmitted,

        whatsappClicks: countEvent("whatsapp_click"),

        phoneClicks: countEvent("phone_click"),

        requestSimilar: countEvent("request_similar"),

        enquiryStarted: countEvent("enquiry_started"),

        chatbotOpens: countEvent("chatbot_open"),

        sampleSearches: countEvent("sample_search"),

        contactForms: countEvent("contact_form_submit"),

        uniqueSessions: sessions.size,

        enquiryRate,
      },

      daily,

      eventBreakdown,

      topPages,

      topSamples,

      topServices,

      recentEvents: events.slice(-50).reverse(),
    });
  } catch (error) {
    console.error("Admin analytics fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load analytics.",
      },
      { status: 500 }
    );
  }
}
