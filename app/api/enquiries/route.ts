import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function validPhone(phone: string) {
  return phone.replace(/\D/g, '').length >= 9;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = clean(body.name);
    const phone = clean(body.phone);
    const email = clean(body.email) || null;
    const serviceId = clean(body.serviceId) || null;
    const sampleId = clean(body.sampleId) || null;
    const message = clean(body.message);
    const preferredContact = clean(body.preferredContact) || 'WHATSAPP';

    // -------------------------
    // Basic validation
    // -------------------------

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your name.' },
        { status: 400 }
      );
    }

    if (!validPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (message.length < 5 || message.length > 3000) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Please tell us briefly what you need.',
        },
        { status: 400 }
      );
    }

    if (!['PHONE', 'WHATSAPP', 'EMAIL'].includes(preferredContact)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid preferred contact method.',
        },
        { status: 400 }
      );
    }

    // -------------------------
    // Validate selected service
    // -------------------------

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: {
          id: serviceId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!service || !service.isActive) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Selected service is not available.',
          },
          { status: 400 }
        );
      }
    }

    // -------------------------
    // Validate selected sample
    // -------------------------

    if (sampleId) {
      const sample = await prisma.sample.findUnique({
        where: {
          id: sampleId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!sample || !sample.isActive) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Selected sample is not available.',
          },
          { status: 400 }
        );
      }
    }

    // -------------------------
    // Create enquiry
    // -------------------------

    const enquiry = await prisma.enquiry.create({
      
      data: {
        name,
        phone,
        email,
        message,
        preferredContact,
        status: 'NEW',
        // source: 'website',

        ...(serviceId
          ? {
              service: {
                connect: {
                  id: serviceId,
                },
              },
            }
          : {}),

        ...(sampleId
          ? {
              sample: {
                connect: {
                  id: sampleId,
                },
              },
            }
          : {}),
      },

      select: {
        id: true,
        createdAt: true,
      },
    });

    // -------------------------
    // Analytics
    // -------------------------

    try {
      await prisma.analyticsEvent.create({
        data: {
          event: 'enquiry_submitted',
          path: '/contact',
          metadata: {
            preferredContact,
            serviceId,
            sampleId,
          },
        },
      });
    } catch (analyticsError) {
      console.error(
        'Enquiry analytics failed:',
        analyticsError
      );
    }

    // -------------------------
    // Success
    // -------------------------

    return NextResponse.json(
      {
        ok: true,
        message: 'Thank you. Your enquiry has been received.',
        enquiryId: enquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enquiry submission failed:', error);

    return NextResponse.json(
      {
        ok: false,
        error:
          'We could not submit your enquiry right now. Please try again or contact us on WhatsApp.',
      },
      { status: 500 }
    );
  }
}
