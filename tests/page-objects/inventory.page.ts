import { type Locator, type Page } from '@playwright/test';

import { PAGE_URLS } from '../test-data/saucedemo.constants';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  addToCartButton(productId: string): Locator {
    return this.page.getByTestId(`add-to-cart-${productId}`);
  }

  removeFromCartButton(productId: string): Locator {
    return this.page.getByTestId(`remove-${productId}`);
  }

  async waitForLoaded(): Promise<void> {
    await this.page.waitForURL(PAGE_URLS.inventory);
  }

  async addProductToCart(productId: string): Promise<void> {
    await this.addToCartButton(productId).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
