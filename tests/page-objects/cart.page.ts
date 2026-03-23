import { type Locator, type Page } from '@playwright/test';

import { PAGE_URLS } from '../test-data/saucedemo.constants';

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.checkoutButton = page.getByTestId('checkout');
  }

  cartItem(name: string): Locator {
    return this.page.getByTestId('inventory-item').filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: name })
    });
  }
  
  async waitForLoaded(): Promise<void> {
    await this.page.waitForURL(PAGE_URLS.cart);
  }

  async startCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
