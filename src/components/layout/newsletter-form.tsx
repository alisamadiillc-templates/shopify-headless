"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { NewsletterState, subscribeToNewsletter } from "./newsletter-actions";

interface NewsletterFormProps {
  variant?: "footer" | "band";
}

export default function NewsletterForm({
  variant = "footer",
}: NewsletterFormProps) {
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

  const band = variant === "band";

  return (
    <div className={cn("flex flex-col gap-2", band ? "w-full" : "max-w-xs")}>
      {!band ? (
        <>
          <p className="font-medium text-black dark:text-white">
            Subscribe to our newsletter
          </p>
          <p className="text-xs">
            New products, discounts, and updates. No spam.
          </p>
        </>
      ) : null}
      <form ref={formRef} action={formAction} className="flex gap-2">
        <Input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className={cn(
            band
              ? "h-12 rounded-full border-transparent bg-white/15 px-5 text-white placeholder:text-white/70 focus-visible:ring-white/50"
              : "h-8 text-xs"
          )}
        />
        <Button
          type="submit"
          size={band ? "lg" : "sm"}
          disabled={pending}
          className={cn(
            "flex-none",
            band
              ? "h-12 rounded-full bg-white px-6 font-medium text-blue-700 hover:bg-blue-50"
              : "h-8 text-xs"
          )}
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
