export const PRODUCTS = {
  backpack: {
    id: 'sauce-labs-backpack',
    name: 'Sauce Labs Backpack'
  }
} as const;

export type Product = (typeof PRODUCTS)[keyof typeof PRODUCTS];
