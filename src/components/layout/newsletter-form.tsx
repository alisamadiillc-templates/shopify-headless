"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { NewsletterState, subscribeToNewsletter } from "./newsletter-actions";

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState<
    NewsletterState,
    FormData
  >(subscribeToNewsletter, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="flex max-w-xs flex-col gap-2">
      <p className="font-medium text-black dark:text-white">
        Subscribe to our newsletter
      </p>
      <p className="text-xs">New products, discounts, and updates. No spam.</p>
      <form ref={formRef} action={formAction} className="flex gap-2">
        <Input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className="h-8 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          disabled={pending}
          className="h-8 flex-none text-xs"
        >
          {pending ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      <p aria-live="polite" className="sr-only" role="status">
        {state?.message}
      </p>
    </div>
  );
}
