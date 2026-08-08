"use client";

import { sendGAEvent } from "@next/third-parties/google";

export type BookEventName = "book_free_trial" | "book_class";

/**
 * Outbound booking link that reports the click to GA4 before navigating.
 *
 * The provider detail page is a server component, so the click handler has to
 * live in a client component. The link is a plain <a> that opens in a new tab,
 * so the current document is never torn down and the event has time to send —
 * no need for a beacon or navigation delay.
 */
export function TrackedBookLink({
  href,
  eventName,
  providerId,
  providerName,
  city,
  category,
  className,
  children,
}: {
  href: string;
  eventName: BookEventName;
  providerId: string;
  providerName: string;
  city: string;
  category: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        sendGAEvent("event", eventName, {
          provider_name: providerName,
          provider_id: providerId,
          city,
          category: category ?? "(none)",
        })
      }
    >
      {children}
    </a>
  );
}
