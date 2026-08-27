import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";

import { CUSTOMER_COOKIES, TAGS } from "@/lib/constants";

import {
  customerApiUrl,
  getCustomerSession,
  refreshAccessToken,
  setTokenCookies,
} from "./auth";
import {
  createAddressMutation,
  deleteAddressMutation,
  updateAddressMutation,
} from "./mutations/address";
import { updateCustomerMutation } from "./mutations/customer";
import {
  getCustomerAddressesQuery,
  getCustomerOrdersQuery,
  getCustomerQuery,
} from "./queries/customer";
import { getOrderQuery } from "./queries/order";
import {
  Customer,
  CustomerAddress,
  CustomerAddressInput,
  CustomerOrder,
  CustomerOrderDetail,
  ShopifyAddressCreateOperation,
  ShopifyAddressDeleteOperation,
  ShopifyAddressUpdateOperation,
  ShopifyCustomerAddressesOperation,
  ShopifyCustomerOperation,
  ShopifyCustomerOrdersOperation,
  ShopifyCustomerUpdateOperation,
  ShopifyOrderOperation,
  UserError,
} from "./types";

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

class CustomerSessionExpiredError extends Error {
  constructor() {
    super("Customer session expired");
  }
}

export async function customerAccountFetch<T>({
  accessToken,
  query,
  variables,
}: {
  accessToken: string;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  const result = await fetch(customerApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({
      ...(query && { query }),
      ...(variables && { variables }),
    }),
  });

  if (result.status === 401) {
    throw new CustomerSessionExpiredError();
  }

  const body = await result.json();

  if (body.errors) {
    const isUnauthenticated = body.errors.some(
      (e: { extensions?: { code?: string } }) =>
        e.extensions?.code === "UNAUTHENTICATED"
    );
    if (isUnauthenticated) {
      throw new CustomerSessionExpiredError();
    }
    throw body.errors[0];
  }

  return {
    status: result.status,
    body,
  };
}

// For server actions: returns a valid access token, refreshing (and
// rotating cookies — allowed in actions) if the current one expired.
// Cached reads must NOT use this; they rely on the proxy having refreshed.
async function getActionAccessToken(): Promise<string | undefined> {
  const session = await getCustomerSession();
  if (session) {
    return session.accessToken;
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(CUSTOMER_COOKIES.refreshToken)?.value;
  if (!refreshToken) {
    return undefined;
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    setTokenCookies(cookieStore, tokens);
    return tokens.accessToken;
  } catch {
    return undefined;
  }
}

export async function getCustomer(): Promise<Customer | undefined> {
  "use cache: private";
  cacheTag(TAGS.customer);
  cacheLife("minutes");

  const session = await getCustomerSession();
  if (!session) {
    return undefined;
  }

  try {
    const res = await customerAccountFetch<ShopifyCustomerOperation>({
      accessToken: session.accessToken,
      query: getCustomerQuery,
    });
    return res.body.data.customer;
  } catch (e) {
    if (e instanceof CustomerSessionExpiredError) {
      return undefined;
    }
    throw e;
  }
}

export async function getCustomerOrders(
  first: number = 20
): Promise<CustomerOrder[] | undefined> {
  "use cache: private";
  cacheTag(TAGS.customer);
  cacheLife("minutes");

  const session = await getCustomerSession();
  if (!session) {
    return undefined;
  }

  try {
    const res = await customerAccountFetch<ShopifyCustomerOrdersOperation>({
      accessToken: session.accessToken,
      query: getCustomerOrdersQuery,
      variables: { first },
    });
    return res.body.data.customer.orders.nodes;
  } catch (e) {
    if (e instanceof CustomerSessionExpiredError) {
      return undefined;
    }
    throw e;
  }
}

export async function getCustomerOrder(
  orderId: string
): Promise<CustomerOrderDetail | undefined> {
  "use cache: private";
  cacheTag(TAGS.customer);
  cacheLife("minutes");

  const session = await getCustomerSession();
  if (!session) {
    return undefined;
  }

  try {
    const res = await customerAccountFetch<ShopifyOrderOperation>({
      accessToken: session.accessToken,
      query: getOrderQuery,
      variables: { orderId },
    });
    return res.body.data.order ?? undefined;
  } catch (e) {
    if (e instanceof CustomerSessionExpiredError) {
      return undefined;
    }
    throw e;
  }
}

export async function getCustomerAddresses(): Promise<
  | {
      defaultAddressId?: string;
      addresses: CustomerAddress[];
    }
  | undefined
> {
  "use cache: private";
  cacheTag(TAGS.customer);
  cacheLife("minutes");

  const session = await getCustomerSession();
  if (!session) {
    return undefined;
  }

  try {
    const res = await customerAccountFetch<ShopifyCustomerAddressesOperation>({
      accessToken: session.accessToken,
      query: getCustomerAddressesQuery,
    });
    return {
      defaultAddressId: res.body.data.customer.defaultAddress?.id,
      addresses: res.body.data.customer.addresses.nodes,
    };
  } catch (e) {
    if (e instanceof CustomerSessionExpiredError) {
      return undefined;
    }
    throw e;
  }
}

const firstErrorMessage = (userErrors: UserError[]): string | undefined =>
  userErrors[0]?.message;

export async function createCustomerAddress(
  address: CustomerAddressInput,
  defaultAddress?: boolean
): Promise<{ error?: string }> {
  const accessToken = await getActionAccessToken();
  if (!accessToken) {
    return { error: "Not logged in" };
  }

  const res = await customerAccountFetch<ShopifyAddressCreateOperation>({
    accessToken,
    query: createAddressMutation,
    variables: { address, defaultAddress },
  });

  return {
    error: firstErrorMessage(res.body.data.customerAddressCreate.userErrors),
  };
}

export async function updateCustomerAddress(
  addressId: string,
  address?: CustomerAddressInput,
  defaultAddress?: boolean
): Promise<{ error?: string }> {
  const accessToken = await getActionAccessToken();
  if (!accessToken) {
    return { error: "Not logged in" };
  }

  const res = await customerAccountFetch<ShopifyAddressUpdateOperation>({
    accessToken,
    query: updateAddressMutation,
    variables: { addressId, address, defaultAddress },
  });

  return {
    error: firstErrorMessage(res.body.data.customerAddressUpdate.userErrors),
  };
}

export async function deleteCustomerAddress(
  addressId: string
): Promise<{ error?: string }> {
  const accessToken = await getActionAccessToken();
  if (!accessToken) {
    return { error: "Not logged in" };
  }

  const res = await customerAccountFetch<ShopifyAddressDeleteOperation>({
    accessToken,
    query: deleteAddressMutation,
    variables: { addressId },
  });

  return {
    error: firstErrorMessage(res.body.data.customerAddressDelete.userErrors),
  };
}

export async function updateCustomerProfile(input: {
  firstName?: string;
  lastName?: string;
}): Promise<{ error?: string }> {
  const accessToken = await getActionAccessToken();
  if (!accessToken) {
    return { error: "Not logged in" };
  }

  const res = await customerAccountFetch<ShopifyCustomerUpdateOperation>({
    accessToken,
    query: updateCustomerMutation,
    variables: { input },
  });

  return { error: firstErrorMessage(res.body.data.customerUpdate.userErrors) };
}
