"use client";

import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
  idleLabel: string;
  pendingLabel?: string;
  className?: string;
};

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (pendingLabel ?? "Working...") : idleLabel}
    </button>
  );
}
