"use client";

import { useActionState, useState } from "react";

import { CustomerAddress } from "@/lib/shopify/customer/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "./actions";

function Field({
  label,
  name,
  defaultValue,
  autoComplete,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function AddressForm({
  address,
  onDone,
}: {
  address?: CustomerAddress;
  onDone: () => void;
}) {
  const action = address ? updateAddress : createAddress;
  const [message, formAction, pending] = useActionState(action, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
    >
      {address ? (
        <input type="hidden" name="addressId" value={address.id} />
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="First name"
          name="firstName"
          defaultValue={address?.firstName}
          autoComplete="given-name"
        />
        <Field
          label="Last name"
          name="lastName"
          defaultValue={address?.lastName}
          autoComplete="family-name"
        />
      </div>
      <Field
        label="Company (optional)"
        name="company"
        defaultValue={address?.company}
        autoComplete="organization"
      />
      <Field
        label="Address"
        name="address1"
        defaultValue={address?.address1}
        autoComplete="address-line1"
      />
      <Field
        label="Apartment, suite, etc. (optional)"
        name="address2"
        defaultValue={address?.address2}
        autoComplete="address-line2"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field
          label="City"
          name="city"
          defaultValue={address?.city}
          autoComplete="address-level2"
        />
        <Field
          label="State / Province code"
          name="zoneCode"
          defaultValue={address?.zoneCode}
          autoComplete="address-level1"
        />
        <Field
          label="ZIP / Postal code"
          name="zip"
          defaultValue={address?.zip}
          autoComplete="postal-code"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Country code (e.g. US)"
          name="territoryCode"
          defaultValue={address?.territoryCode}
          autoComplete="country"
        />
        <Field
          label="Phone (optional)"
          name="phoneNumber"
          defaultValue={address?.phoneNumber}
          autoComplete="tel"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="defaultAddress" />
        Set as default address
      </label>
      {message ? (
        <p aria-live="polite" className="text-sm text-red-600" role="status">
          {message}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : address ? "Save address" : "Add address"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddressCard({
  address,
  isDefault,
  onEdit,
}: {
  address: CustomerAddress;
  isDefault: boolean;
  onEdit: () => void;
}) {
  const [deleteMessage, deleteFormAction] = useActionState(deleteAddress, null);
  const [defaultMessage, defaultFormAction] = useActionState(
    setDefaultAddress,
    null
  );

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
      {isDefault ? (
        <span className="self-start rounded-sm bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
          Default
        </span>
      ) : null}
      <div className="text-sm text-neutral-700 dark:text-neutral-300">
        {address.formatted.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {deleteMessage || defaultMessage ? (
        <p aria-live="polite" className="text-sm text-red-600" role="status">
          {deleteMessage || defaultMessage}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <form action={deleteFormAction.bind(null, address.id)}>
          <Button type="submit" variant="outline" size="sm">
            Delete
          </Button>
        </form>
        {!isDefault ? (
          <form action={defaultFormAction.bind(null, address.id)}>
            <Button type="submit" variant="outline" size="sm">
              Set as default
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

interface AddressesProps {
  addresses: CustomerAddress[];
  defaultAddressId?: string;
}

export default function Addresses({
  addresses,
  defaultAddressId,
}: AddressesProps) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && editing !== "new" ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          You haven't saved any addresses yet.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {addresses.map((address) =>
          editing === address.id ? (
            <AddressForm
              key={address.id}
              address={address}
              onDone={() => setEditing(null)}
            />
          ) : (
            <AddressCard
              key={address.id}
              address={address}
              isDefault={address.id === defaultAddressId}
              onEdit={() => setEditing(address.id)}
            />
          )
        )}
      </div>
      {editing === "new" ? (
        <AddressForm onDone={() => setEditing(null)} />
      ) : (
        <Button
          type="button"
          className="self-start"
          onClick={() => setEditing("new")}
        >
          Add address
        </Button>
      )}
    </div>
  );
}
