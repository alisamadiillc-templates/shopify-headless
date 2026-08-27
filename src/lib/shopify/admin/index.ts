import { SHOPIFY_ADMIN_API_VERSION } from "@/lib/constants";
import { ensureStartsWith } from "@/lib/utils";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = domain
  ? `${domain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`
  : "";

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

// Tokens from the client-credentials grant last ~24h; cache in memory and
// renew a minute early. Fluid Compute reuses instances, so this usually
// survives across requests.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (staticToken) {
    return staticToken;
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Set SHOPIFY_ADMIN_ACCESS_TOKEN, or SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET"
    );
  }

  const result = await fetch(`${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!result.ok) {
    throw new Error(
      `Admin token request failed (${result.status}): ${await result.text()}`
    );
  }

  const body = (await result.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000 - 60_000,
  };

  return body.access_token;
}

async function adminFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  if (!endpoint) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not set");
  }

  const key = await getAdminAccessToken();

  const result = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": key,
    },
    body: JSON.stringify({
      ...(query && { query }),
      ...(variables && { variables }),
    }),
  });

  const body = await result.json();

  if (body.errors) {
    throw body.errors[0];
  }

  return {
    status: result.status,
    body,
  };
}

const getCustomerByEmailQuery = /* GraphQL */ `
  query getCustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      nodes {
        id
        email
        emailMarketingConsent {
          marketingState
        }
      }
    }
  }
`;

const customerCreateMutation = /* GraphQL */ `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const customerEmailMarketingConsentUpdateMutation = /* GraphQL */ `
  mutation customerEmailMarketingConsentUpdate(
    $input: CustomerEmailMarketingConsentUpdateInput!
  ) {
    customerEmailMarketingConsentUpdate(input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`;

type UserError = {
  field?: string[];
  message: string;
};

type AdminCustomerSearchOperation = {
  data: {
    customers: {
      nodes: {
        id: string;
        email: string;
        emailMarketingConsent: { marketingState: string } | null;
      }[];
    };
  };
  variables: {
    query: string;
  };
};

type AdminCustomerCreateOperation = {
  data: {
    customerCreate: {
      customer: { id: string } | null;
      userErrors: UserError[];
    };
  };
  variables: {
    input: {
      email: string;
      emailMarketingConsent: {
        marketingState: "SUBSCRIBED";
        marketingOptInLevel: "SINGLE_OPT_IN";
      };
    };
  };
};

type AdminConsentUpdateOperation = {
  data: {
    customerEmailMarketingConsentUpdate: {
      userErrors: UserError[];
    };
  };
  variables: {
    input: {
      customerId: string;
      emailMarketingConsent: {
        marketingState: "SUBSCRIBED";
        marketingOptInLevel: "SINGLE_OPT_IN";
      };
    };
  };
};

const SUBSCRIBED_CONSENT = {
  marketingState: "SUBSCRIBED",
  marketingOptInLevel: "SINGLE_OPT_IN",
} as const;

export async function subscribeEmailToMarketing(
  email: string
): Promise<{ error?: string; alreadySubscribed?: boolean }> {
  const search = await adminFetch<AdminCustomerSearchOperation>({
    query: getCustomerByEmailQuery,
    variables: { query: `email:${email}` },
  });

  const existing = search.body.data.customers.nodes[0];

  if (!existing) {
    const res = await adminFetch<AdminCustomerCreateOperation>({
      query: customerCreateMutation,
      variables: {
        input: { email, emailMarketingConsent: SUBSCRIBED_CONSENT },
      },
    });
    return { error: res.body.data.customerCreate.userErrors[0]?.message };
  }

  if (existing.emailMarketingConsent?.marketingState === "SUBSCRIBED") {
    return { alreadySubscribed: true };
  }

  const res = await adminFetch<AdminConsentUpdateOperation>({
    query: customerEmailMarketingConsentUpdateMutation,
    variables: {
      input: {
        customerId: existing.id,
        emailMarketingConsent: SUBSCRIBED_CONSENT,
      },
    },
  });
  return {
    error:
      res.body.data.customerEmailMarketingConsentUpdate.userErrors[0]?.message,
  };
}
