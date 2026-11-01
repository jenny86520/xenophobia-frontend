"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FormField, type FormFieldProps } from "./form-controls";

const noSubscription = () => () => {};

/**
 * A password input with a 顯示密碼 toggle. The toggle only appears once the page is hydrated, so
 * without JavaScript the field is a plain hidden password; submitting the form hides it again.
 */
export function PasswordField(props: Omit<FormFieldProps, "type" | "trailing" | "ref">) {
  const [shown, setShown] = useState(false);
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const hide = () => setShown(false);
    form.addEventListener("submit", hide);
    return () => form.removeEventListener("submit", hide);
  }, []);

  const Icon = shown ? EyeOff : Eye;
  return (
    <FormField
      {...props}
      ref={input}
      type={shown ? "text" : "password"}
      trailing={
        hydrated && (
          <button
            type="button"
            aria-label="顯示密碼"
            aria-pressed={shown}
            aria-controls={props.id}
            onClick={() => setShown((value) => !value)}
            className="absolute inset-y-0 right-0 inline-flex w-11 cursor-pointer items-center justify-center rounded-r-sm text-ink-secondary hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Icon aria-hidden="true" className="size-5" />
          </button>
        )
      }
    />
  );
}
