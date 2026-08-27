import addressFragment from "../fragments/address";

export const createAddressMutation = /* GraphQL */ `
  mutation customerAddressCreate(
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        ...customerAddress
      }
      userErrors {
        field
        message
      }
    }
  }
  ${addressFragment}
`;

export const updateAddressMutation = /* GraphQL */ `
  mutation customerAddressUpdate(
    $addressId: ID!
    $address: CustomerAddressInput
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(
      addressId: $addressId
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        ...customerAddress
      }
      userErrors {
        field
        message
      }
    }
  }
  ${addressFragment}
`;

export const deleteAddressMutation = /* GraphQL */ `
  mutation customerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`;
