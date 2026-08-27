"use server";

import { subscribeEmailToMarketing } from "@/lib/shopify/admin";

export type NewsletterState = {
  success?: boolean;
  message: string;
} | null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!EMAIL_REGEX.test(email)) {
    return { message: "Enter a valid email address." };
  }

  try {
    const { error, alreadySubscribed } = await subscribeEmailToMarketing(email);

    if (error) {
      return { message: error };
    }

    if (alreadySubscribed) {
      return { success: true, message: "You're already subscribed." };
    }

    return { success: true, message: "You're subscribed!" };
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong. Please try again." };
  }
}
