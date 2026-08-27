const policyFragment = /* GraphQL */ `
  fragment policy on ShopPolicy {
    id
    title
    handle
    body
    url
  }
`;

export const getShopPoliciesQuery = /* GraphQL */ `
  query getShopPolicies {
    shop {
      privacyPolicy {
        ...policy
      }
      refundPolicy {
        ...policy
      }
      shippingPolicy {
        ...policy
      }
      termsOfService {
        ...policy
      }
      contactInformation {
        ...policy
      }
      legalNotice {
        ...policy
      }
      subscriptionPolicy {
        id
        title
        handle
        body
        url
      }
    }
  }
  ${policyFragment}
`;

// URL handle -> Shop field. Handles match Shopify's own hosted /policies/* URLs.
export const POLICY_HANDLES = {
  "refund-policy": "refundPolicy",
  "privacy-policy": "privacyPolicy",
  "terms-of-service": "termsOfService",
  "shipping-policy": "shippingPolicy",
  "subscription-policy": "subscriptionPolicy",
  "contact-information": "contactInformation",
  "legal-notice": "legalNotice",
} as const;

export type PolicyHandle = keyof typeof POLICY_HANDLES;
export type PolicyField = (typeof POLICY_HANDLES)[PolicyHandle];
