'use client';

import { FormEvent, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export type EnquiryServiceOption = { id: string; name: string };
export type EnquirySampleOption = { id: string; title: string };

type Props = {
  services?: EnquiryServiceOption[];
  samples?: EnquirySampleOption[];
  defaultServiceId?: string;
  defaultSampleId?: string;
};

export default function EnquiryForm({
  services = [],
  samples = [],
  defaultServiceId = '',
  defaultSampleId = '',
}: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const started = useRef(false);

  function trackStart() {
    if (started.current) return;
    started.current = true;
    trackEvent({ event: 'enquiry_started' });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setSuccess('');
    setError('');

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get('name') || ''),
      phone: String(data.get('phone') || ''),
      email: String(data.get('email') || ''),
      serviceId: String(data.get('serviceId') || ''),
      sampleId: String(data.get('sampleId') || ''),
      preferredContact: String(data.get('preferredContact') || 'WHATSAPP'),
      message: String(data.get('message') || ''),
    };

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await response.json()
        : { ok: false, error: await response.text() };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || `Submission failed (${response.status}).`);
      }

      form.reset();
      setSuccess('Thank you! Your enquiry has been received. Our team will contact you shortly.');
      trackEvent({ event: 'contact_form_submit', metadata: { serviceId: payload.serviceId || null, sampleId: payload.sampleId || null } });
    } catch (submissionError) {
      console.error('Enquiry form submission failed:', submissionError);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to submit enquiry. Please try again or contact us on WhatsApp.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} onFocus={trackStart} className="space-y-5 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a2b]">Start an enquiry</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#292522]">Tell us what you need</h2>
        <p className="mt-2 text-sm leading-6 text-[#6e665f]">
          Share the basics and our team can follow up with you about your printing requirement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#292522]">
          Name *
          <input name="name" required minLength={2} maxLength={100} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#7a1f2b]" placeholder="Your name" />
        </label>

        <label className="text-sm font-medium text-[#292522]">
          Phone *
          <input name="phone" required inputMode="tel" className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#7a1f2b]" placeholder="+91 98XXXXXXXX" />
        </label>
      </div>

      <label className="block text-sm font-medium text-[#292522]">
        Email
        <input name="email" type="email" className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#7a1f2b]" placeholder="you@example.com" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#292522]">
          Service
          <select name="serviceId" defaultValue={defaultServiceId} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#7a1f2b]">
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-[#292522]">
          Sample
          <select name="sampleId" defaultValue={defaultSampleId} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#7a1f2b]">
            <option value="">Select a sample</option>
            {samples.map((sample) => (
              <option key={sample.id} value={sample.id}>{sample.title}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-[#292522]">
        Preferred contact
        <select name="preferredContact" defaultValue="WHATSAPP" className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#7a1f2b]">
          <option value="WHATSAPP">WhatsApp</option>
          <option value="PHONE">Phone call</option>
          <option value="EMAIL">Email</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-[#292522]">
        What do you need? *
        <textarea name="message" required minLength={5} maxLength={3000} rows={5} className="mt-2 w-full resize-y rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#7a1f2b]" placeholder="Tell us about the printing, quantity, size, finishing, or anything else you already know." />
      </label>

      {success && <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <button disabled={loading} type="submit" className="w-full rounded-xl bg-[#7a1f2b] px-5 py-3.5 font-semibold text-white transition hover:bg-[#641822] disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? 'Sending enquiry…' : 'Send enquiry'}
      </button>

      <p className="text-center text-xs leading-5 text-[#817970]">
        We only use the information you provide to respond to your enquiry.
      </p>
    </form>
  );
}
