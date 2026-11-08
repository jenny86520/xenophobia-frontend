"use client";

import { useEffect, useRef } from "react";
import { acknowledgeNewsAction } from "@/app/news/actions";
import { MetaLabel } from "@/components/brand/meta-label";
import { ctaPrimaryClasses } from "@/components/brand/cta-link";
import type { NewsReminder as Reminder } from "@/types/news";
import { formatTaipeiDate } from "@/utils/datetime";

/**
 * The messages a member is reminded of once (the backend picks them). Rendered on the server as an
 * open <dialog> with one form, so it shows and 「知道了」 works without JavaScript; each 看全文 is a
 * submit with `next`, so opening a message also counts the whole popup as read. After hydration it
 * becomes a modal (focus kept inside, backdrop) and Esc submits the same form.
 */
export function NewsReminder({ reminders }: { reminders: Reminder[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || typeof dialog.showModal !== "function") return;
    // Re-open as a modal: showModal() refuses a dialog that is already open.
    dialog.close();
    dialog.showModal();
  }, []);

  if (reminders.length === 0) return null;
  return (
    <dialog
      ref={dialogRef}
      open
      aria-labelledby="news-reminder-title"
      className="news-reminder"
      onCancel={(event) => {
        // Esc: closing counts as seen, like the button.
        event.preventDefault();
        formRef.current?.requestSubmit();
      }}
    >
      <form ref={formRef} action={acknowledgeNewsAction} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <MetaLabel>
            <span lang="en">News</span>
          </MetaLabel>
          <h2 id="news-reminder-title" className="font-heading text-h2 text-ink">
            最新消息
          </h2>
        </div>
        <ul className="flex flex-col">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="flex flex-col gap-2 border-t border-line py-4">
              <input type="hidden" name="ids" value={reminder.id} />
              <MetaLabel>
                <time dateTime={reminder.publishAt}>{formatTaipeiDate(reminder.publishAt)}</time>
              </MetaLabel>
              <h3 className="font-heading text-h3 text-ink">{reminder.title}</h3>
              {reminder.excerpt && <p className="text-body text-ink-secondary">{reminder.excerpt}</p>}
              <button
                type="submit"
                name="next"
                value={`/news/${reminder.id}`}
                className="link-underline self-start text-body text-ink-secondary hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                看全文<span className="sr-only">：{reminder.title}</span>
              </button>
            </li>
          ))}
        </ul>
        <button type="submit" autoFocus className={ctaPrimaryClasses("default", "self-end")}>
          知道了
        </button>
      </form>
    </dialog>
  );
}
