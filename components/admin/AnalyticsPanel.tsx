
"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState, Feedback } from "./AdminUI";

type Activity = {
  summary: { pageViews: number; sampleViews: number; enquiries: number };
  daily: { date: string; pageViews: number; sampleViews: number; enquiries: number }[];
};

type Range = "7d" | "30d" | "90d";

const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
function formatDay(value: string) {
  return date.format(new Date(value));
}

export default function AnalyticsPanel() {
  const [range, setRange] = useState<Range>("30d");
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ activity: Activity } | { error: true } | null>(null);
  const activity = result && "activity" in result ? result.activity : null;

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/admin/analytics?range=${range}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!data.success) throw new Error();
        if (!controller.signal.aborted) setResult({ activity: data });
      } catch {
        if (!controller.signal.aborted) setResult({ error: true });
      }
    }
    void load();
    return () => controller.abort();
  }, [range, retry]);

  const summary = [
    ["Page views", activity?.summary.pageViews, "#6d2430"],
    ["Sample views", activity?.summary.sampleViews, "#2563eb"],
    ["Enquiries", activity?.summary.enquiries, "#166137"],
  ] as const;
  const hasActivity = summary.some(([, value]) => Boolean(value));

  return (
    <section className="ad-card ad-pad space-y-4" aria-labelledby="activity-title" aria-busy={!result}>
      <div className="ad-section-head">
        <div>
          <h2 className="ad-section-title" id="activity-title">Website activity</h2>
          <p className="ad-muted mt-1 text-sm">Tracked activity by day, in UTC.</p>
        </div>
        <select aria-label="Activity date range" className="ad-select !w-auto" value={range} onChange={(event) => { setResult(null); setRange(event.target.value as Range); }}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
      {!result && <Feedback>Loading website activity…</Feedback>}
      {result && "error" in result && (
        <div className="space-y-3">
          <Feedback tone="error">Website activity could not load.</Feedback>
          <button type="button" className="ad-button" onClick={() => { setResult(null); setRetry(retry + 1); }}>Try again</button>
        </div>
      )}
      {activity && (
        <>
          <dl className="grid grid-cols-3 gap-2">
            {summary.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[var(--ad-bg)] p-2.5 sm:p-3">
                <dt className="ad-muted text-xs font-bold">{label}</dt>
                <dd className="mt-1 text-xl font-extrabold tabular-nums">{value?.toLocaleString("en-IN")}</dd>
              </div>
            ))}
          </dl>
          {hasActivity ? (
            <div className="ad-chart" role="img" aria-label="Daily page views, sample views and enquiry submissions. Expand Daily activity data for individual counts.">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 280, height: 220 }}>
                <LineChart data={activity.daily} margin={{ top: 8, right: 14, bottom: 4, left: -14 }}>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDay} minTickGap={18} tick={{ fill: "#5e6879", fontSize: 11 }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#5e6879", fontSize: 11 }} tickLine={false} />
                  <Tooltip labelFormatter={formatDay} contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb", fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  {(["pageViews", "sampleViews", "enquiries"] as const).map((key, index) => (
                    <Line key={key} type="linear" dataKey={key} name={summary[index][0]} stroke={summary[index][2]} strokeWidth={2} dot={activity.daily.length === 1} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState>No page views, sample views or enquiry submissions were recorded in this range.</EmptyState>}
          {hasActivity && (
            <details className="rounded-lg border border-[var(--ad-line)] px-3">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold">Daily activity data</summary>
              <ul className="ad-list text-sm">
                {activity.daily.map((day) => (
                  <li key={day.date} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2">
                    <time dateTime={day.date} className="font-bold">{formatDay(day.date)}</time>
                    <span className="ad-muted">{day.pageViews} page · {day.sampleViews} sample · {day.enquiries} enquiries</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
