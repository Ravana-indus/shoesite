export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice: Money | null;
  image?: Image;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  compareAtPriceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: {
    edges: {
      node: ProductVariant;
    }[];
  };
  featuredImage: Image | null;
  images: {
    edges: {
      node: Image;
    }[];
  };
  seo: {
    description: string;
    title: string;
  };
  tags: string[];
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: {
    description: string;
    title: string;
  };
};

export type CartItem = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: Image;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: {
    edges: {
      node: CartItem;
    }[];
  };
  totalQuantity: number;
};
