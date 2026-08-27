const addressFragment = /* GraphQL */ `
  fragment customerAddress on CustomerAddress {
    id
    firstName
    lastName
    company
    address1
    address2
    city
    zoneCode
    territoryCode
    zip
    phoneNumber
    formatted
  }
`;

export default addressFragment;
