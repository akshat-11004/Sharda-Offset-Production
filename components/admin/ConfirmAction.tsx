
"use client";

import { useId, useRef } from "react";

export default function ConfirmAction({ label, title, disabled, onConfirm, accessibleLabel }: {
  label: string;
  title: string;
  disabled?: boolean;
  onConfirm: () => void;
  accessibleLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const description = useId();

  return (
    <>
      <button type="button" className="ad-button ad-danger" disabled={disabled} aria-label={accessibleLabel} onClick={() => dialog.current?.showModal()}>{label}</button>
      <dialog ref={dialog} className="ad-dialog ad-pad" aria-labelledby={heading} aria-describedby={description}>
        <h2 id={heading} className="ad-section-title">{title}</h2>
        <p id={description} className="ad-muted mt-2 text-sm">This action is permanent.</p>
        <div className="ad-actions">
          <button type="button" className="ad-button" autoFocus onClick={() => dialog.current?.close()}>Cancel</button>
          <button type="button" className="ad-button ad-danger-solid" onClick={() => { dialog.current?.close(); onConfirm(); }}>{label}</button>
        </div>
      </dialog>
    </>
  );
}
