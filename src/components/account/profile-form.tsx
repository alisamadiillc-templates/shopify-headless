"use client";

import { useActionState } from "react";

import { Customer } from "@/lib/shopify/customer/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { updateProfile } from "./actions";

interface ProfileFormProps {
  customer: Customer;
}

export default function ProfileForm({ customer }: ProfileFormProps) {
  const [message, formAction, pending] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="firstName" className="text-sm font-medium">
          First name
        </label>
        <Input
          id="firstName"
          name="firstName"
          defaultValue={customer.firstName ?? ""}
          autoComplete="given-name"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="lastName" className="text-sm font-medium">
          Last name
        </label>
        <Input
          id="lastName"
          name="lastName"
          defaultValue={customer.lastName ?? ""}
          autoComplete="family-name"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Email</label>
        <Input
          value={customer.emailAddress?.emailAddress ?? ""}
          disabled
          readOnly
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Your email is managed through Shopify login and can't be changed here.
        </p>
      </div>
      {message ? (
        <p aria-live="polite" className="text-sm text-red-600" role="status">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
