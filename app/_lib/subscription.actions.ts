"use server";

import { redirect } from "next/navigation";
import {
  deleteSubscriberByToken,
  isValidEmail,
  normalizeEmail,
  subscribeEmail,
} from "@/app/_lib/subscribers";
import type { SubscriptionFormState } from "@/app/_lib/subscription.form-state";

export async function subscribeAction(
  _previousState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  try {
    const outcome = await subscribeEmail(email);

    return {
      status: "success",
      message:
        outcome === "created"
          ? "You're on the list. Expect an email whenever a new photograph goes up."
          : "That address is already on the list.",
    };
  } catch (error) {
    console.error("[subscribe] Could not store the address", error);

    return {
      status: "error",
      message: "Something went wrong on our side. Please try again later.",
    };
  }
}

export async function confirmUnsubscribeAction(
  formData: FormData,
): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const removed = await deleteSubscriberByToken(token);

  redirect(removed ? "/unsubscribe?state=removed" : "/unsubscribe?state=unknown");
}
