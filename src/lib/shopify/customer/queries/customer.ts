import addressFragment from "../fragments/address";
import { orderSummaryFragment } from "../fragments/order";

export const getCustomerQuery = /* GraphQL */ `
  query getCustomer {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      defaultAddress {
        ...customerAddress
      }
    }
  }
  ${addressFragment}
`;

export const getCustomerOrdersQuery = /* GraphQL */ `
  query getCustomerOrders($first: Int!) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          ...orderSummary
        }
      }
    }
  }
  ${orderSummaryFragment}
`;

export const getCustomerAddressesQuery = /* GraphQL */ `
  query getCustomerAddresses {
    customer {
      defaultAddress {
        id
      }
      addresses(first: 20) {
        nodes {
          ...customerAddress
        }
      }
    }
  }
  ${addressFragment}
`;
