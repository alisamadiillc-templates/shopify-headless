"use server";

import { updateTag } from "next/cache";

import { TAGS } from "@/lib/constants";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
} from "@/lib/shopify/customer";
import { CustomerAddressInput } from "@/lib/shopify/customer/types";

function addressFromFormData(formData: FormData): CustomerAddressInput {
  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  return {
    firstName: field("firstName"),
    lastName: field("lastName"),
    company: field("company"),
    address1: field("address1"),
    address2: field("address2"),
    city: field("city"),
    zoneCode: field("zoneCode"),
    territoryCode: field("territoryCode"),
    zip: field("zip"),
    phoneNumber: field("phoneNumber"),
  };
}

export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const { error } = await updateCustomerProfile({
      firstName: (formData.get("firstName") as string) ?? undefined,
      lastName: (formData.get("lastName") as string) ?? undefined,
    });

    if (error) {
      return error;
    }

    updateTag(TAGS.customer);
  } catch (e) {
    return "Error updating profile";
  }
}

export async function createAddress(prevState: any, formData: FormData) {
  try {
    const { error } = await createCustomerAddress(
      addressFromFormData(formData),
      formData.get("defaultAddress") === "on"
    );

    if (error) {
      return error;
    }

    updateTag(TAGS.customer);
  } catch (e) {
    return "Error creating address";
  }
}

export async function updateAddress(prevState: any, formData: FormData) {
  const addressId = formData.get("addressId") as string;

  if (!addressId) {
    return "Missing address id";
  }

  try {
    const { error } = await updateCustomerAddress(
      addressId,
      addressFromFormData(formData),
      formData.get("defaultAddress") === "on" || undefined
    );

    if (error) {
      return error;
    }

    updateTag(TAGS.customer);
  } catch (e) {
    return "Error updating address";
  }
}

export async function deleteAddress(prevState: any, addressId: string) {
  try {
    const { error } = await deleteCustomerAddress(addressId);

    if (error) {
      return error;
    }

    updateTag(TAGS.customer);
  } catch (e) {
    return "Error deleting address";
  }
}

export async function setDefaultAddress(prevState: any, addressId: string) {
  try {
    const { error } = await updateCustomerAddress(addressId, undefined, true);

    if (error) {
      return error;
    }

    updateTag(TAGS.customer);
  } catch (e) {
    return "Error updating default address";
  }
}
