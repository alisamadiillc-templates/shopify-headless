import { orderDetailFragment } from "../fragments/order";

export const getOrderQuery = /* GraphQL */ `
  query getOrder($orderId: ID!) {
    order(id: $orderId) {
      ...orderDetail
    }
  }
  ${orderDetailFragment}
`;
