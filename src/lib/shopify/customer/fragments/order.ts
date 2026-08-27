import addressFragment from "./address";

export const orderSummaryFragment = /* GraphQL */ `
  fragment orderSummary on Order {
    id
    name
    number
    processedAt
    financialStatus
    fulfillments(first: 5) {
      nodes {
        status
      }
    }
    totalPrice {
      amount
      currencyCode
    }
  }
`;

export const orderDetailFragment = /* GraphQL */ `
  fragment orderDetail on Order {
    ...orderSummary
    statusPageUrl
    subtotal {
      amount
      currencyCode
    }
    totalShipping {
      amount
      currencyCode
    }
    totalTax {
      amount
      currencyCode
    }
    shippingAddress {
      ...customerAddress
    }
    lineItems(first: 50) {
      nodes {
        id
        title
        variantTitle
        quantity
        image {
          url
          altText
        }
        price {
          amount
          currencyCode
        }
        totalPrice {
          amount
          currencyCode
        }
      }
    }
  }
  ${orderSummaryFragment}
  ${addressFragment}
`;
