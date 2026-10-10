'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { business } from '@/lib-data';
import { trackEvent } from '@/lib/analytics';

export function EnquiryCta({ sample = '' }: { sample?: string }) {
  const message = sample ? `Hello, I am interested in a design similar to: ${sample}. Please share details and pricing.` : 'Hello, I would like to discuss a printing requirement.';
  return <section className="py-20"><div className="container-shell overflow-hidden rounded-[2rem] bg-[var(--foreground)] p-8 text-white md:p-12"><div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end"><div><p className="eyebrow text-[#d9bd82]">Ready when you are</p><h2 className="display mt-3 max-w-2xl text-4xl md:text-5xl">Have a printing requirement? Let’s make it tangible.</h2><p className="mt-4 max-w-xl leading-7 text-white/65">Share your quantity, format, reference or idea. The shop can guide you on the next step.</p></div><div className="flex flex-wrap gap-3"><Link href="/contact" className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)]">Send enquiry <ArrowRight size={16}/></Link><a onClick={() => trackEvent({ event: 'whatsapp_click', metadata: { location: 'enquiry_cta' } })} href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`} className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold"><MessageCircle size={16}/> WhatsApp</a></div></div></div></section>;
}
