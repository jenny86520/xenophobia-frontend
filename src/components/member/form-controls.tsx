import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MemberActionState } from "@/types/member";

type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "password";
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  maxLength?: number;
  minLength?: number;
  hint?: ReactNode;
  /** The backend's message for this field. */
  error?: string;
};

/**
 * A labelled input in the brand style; the hint and the error are linked through aria-describedby.
 * A 必填/選填 tag sits beside the label (outside it, so the accessible name stays the label text);
 * assistive tech gets "required" from the input itself.
 */
export function FormField({ id, name, label, type = "text", hint, error, ...input }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <label htmlFor={id} className="text-body text-ink">
          {label}
        </label>
        <span
          aria-hidden="true"
          className={cn("font-mono text-meta", input.required ? "text-signal" : "text-ink-muted")}
        >
          {input.required ? "必填" : "選填"}
        </span>
      </div>
      <input
        id={id}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "w-full rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-body text-ink",
          "placeholder:text-ink-muted focus-visible:border-signal focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          "aria-invalid:border-destructive",
        )}
        {...input}
      />
      {hint && (
        <p id={hintId} className="text-caption text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Primary submit button in the CTA style. */
export function SubmitButton({ pending, children, className }: { pending: boolean; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "cta-primary inline-flex items-center justify-center gap-3 rounded-sm bg-cta px-5 py-3 text-body font-medium text-cta-ink",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60",
        className,
      )}
    >
      {pending ? "處理中…" : children}
    </button>
  );
}

/** The action's overall result: an alert for errors, a status for success. */
export function FormMessage({ state }: { state: MemberActionState }) {
  if (!state.message) return null;
  return state.ok ? (
    <p role="status" className="border-l-2 border-signal pl-3 text-body text-ink">
      {state.message}
    </p>
  ) : (
    <p role="alert" className="border-l-2 border-destructive pl-3 text-body text-destructive">
      {state.message}
    </p>
  );
}
