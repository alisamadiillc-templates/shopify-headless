export type Money = {
  amount: string;
  currencyCode: string;
};

export type CustomerAddress = {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zoneCode?: string;
  territoryCode?: string;
  zip?: string;
  phoneNumber?: string;
  formatted: string[];
};

export type CustomerAddressInput = {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zoneCode?: string;
  territoryCode?: string;
  zip?: string;
  phoneNumber?: string;
};

export type Customer = {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: {
    emailAddress: string;
  };
  defaultAddress?: CustomerAddress;
};

export type OrderLineItem = {
  id: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  image?: {
    url: string;
    altText?: string;
  };
  price?: Money;
  totalPrice?: Money;
};

export type CustomerOrder = {
  id: string;
  name: string;
  number: number;
  processedAt: string;
  financialStatus?: string;
  fulfillments: { nodes: { status?: string }[] };
  totalPrice?: Money;
};

export type CustomerOrderDetail = CustomerOrder & {
  statusPageUrl?: string;
  subtotal?: Money;
  totalShipping?: Money;
  totalTax?: Money;
  shippingAddress?: CustomerAddress;
  lineItems: { nodes: OrderLineItem[] };
};

export type UserError = {
  field?: string[];
  message: string;
};

export type ShopifyCustomerOperation = {
  data: {
    customer: Customer;
  };
};

export type ShopifyCustomerOrdersOperation = {
  data: {
    customer: {
      orders: { nodes: CustomerOrder[] };
    };
  };
  variables: {
    first: number;
  };
};

export type ShopifyCustomerAddressesOperation = {
  data: {
    customer: {
      defaultAddress?: { id: string };
      addresses: { nodes: CustomerAddress[] };
    };
  };
};

export type ShopifyOrderOperation = {
  data: {
    order: CustomerOrderDetail | null;
  };
  variables: {
    orderId: string;
  };
};

export type ShopifyAddressCreateOperation = {
  data: {
    customerAddressCreate: {
      customerAddress: CustomerAddress | null;
      userErrors: UserError[];
    };
  };
  variables: {
    address: CustomerAddressInput;
    defaultAddress?: boolean;
  };
};

export type ShopifyAddressUpdateOperation = {
  data: {
    customerAddressUpdate: {
      customerAddress: CustomerAddress | null;
      userErrors: UserError[];
    };
  };
  variables: {
    addressId: string;
    address?: CustomerAddressInput;
    defaultAddress?: boolean;
  };
};

export type ShopifyAddressDeleteOperation = {
  data: {
    customerAddressDelete: {
      deletedAddressId: string | null;
      userErrors: UserError[];
    };
  };
  variables: {
    addressId: string;
  };
};

export type ShopifyCustomerUpdateOperation = {
  data: {
    customerUpdate: {
      customer: Pick<Customer, "firstName" | "lastName"> | null;
      userErrors: UserError[];
    };
  };
  variables: {
    input: {
      firstName?: string;
      lastName?: string;
    };
  };
};
