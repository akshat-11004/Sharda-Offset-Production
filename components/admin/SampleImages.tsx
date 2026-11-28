
"use client";

import { useId } from "react";
import { ArrowUp, Trash2 } from "lucide-react";
import AdminImage from "./AdminImage";
import { FormSection } from "./AdminUI";

export function getSampleImageUrls(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export default function SampleImages({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) {
  const help = useId();
  const urls = getSampleImageUrls(value);

  function remove(index: number) {
    onChange(urls.filter((_, itemIndex) => itemIndex !== index).join("\n"));
  }

  function promote(index: number) {
    onChange([urls[index], ...urls.filter((_, itemIndex) => itemIndex !== index)].join("\n"));
  }

  return (
    <FormSection title="Sample images" description="Paste links to hosted images and check each preview before saving.">
      <label className="ad-field">
        Image URLs <span className="ad-muted text-xs font-medium">Optional</span>
        <textarea className="ad-input" aria-describedby={help} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} rows={3} placeholder="https://example.com/sample-photo.jpg" spellCheck={false} />
        <small id={help}>Use one URL per line. The first link is the main image.</small>
      </label>
      {urls.length > 0 && (
        <ol className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,175px),1fr))] gap-3">
          {urls.map((url, index) => (
            <li key={index} className="min-w-0 overflow-hidden rounded-lg border border-[var(--ad-line)]">
              <AdminImage src={url} alt={`Sample preview ${index + 1}`} />
              <div className="flex flex-wrap items-center justify-between gap-1 p-2">
                <p className="text-xs font-bold">{index === 0 ? "Main image" : `Image ${index + 1}`}</p>
                <div className="ad-actions">
                  {index !== 0 && <button type="button" className="ad-button ad-icon-button" title="Make main image" aria-label={`Make image ${index + 1} the main image`} disabled={disabled} onClick={() => promote(index)}><ArrowUp aria-hidden="true" /></button>}
                  <button type="button" className="ad-button ad-danger ad-icon-button" title="Remove image link" aria-label={`Remove image ${index + 1} link`} disabled={disabled} onClick={() => remove(index)}><Trash2 aria-hidden="true" /></button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </FormSection>
  );
}
