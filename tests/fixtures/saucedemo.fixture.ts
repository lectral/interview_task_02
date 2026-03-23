import { test as base } from '@playwright/test';

import { createLoginAsStandardUserAction } from '../actions/login-as-standard-user.action';
import { createOpenAndLoginAsAction } from '../actions/open-and-login-as.action';
import { CartPage } from '../page-objects/cart.page';
import { CheckoutInformationPage } from '../page-objects/checkout-information.page';
import { InventoryPage } from '../page-objects/inventory.page';
import { LoginPage } from '../page-objects/login.page';
import type { UserCredentials } from '../test-data/users';

type SauceDemoPages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
};

type SauceDemoActions = {
  openCart: () => Promise<void>;
  openAndLoginAs: (user: UserCredentials) => Promise<void>;
  loginAsStandardUser: () => Promise<void>;
};

export type SauceDemoUi = SauceDemoPages & {
  actions: SauceDemoActions;
};

type SauceDemoFixtures = {
  ui: SauceDemoUi;
};

export const test = base.extend<SauceDemoFixtures>({
  ui: async ({ page }, use) => {
    const pages: SauceDemoPages = {
      loginPage: new LoginPage(page),
      inventoryPage: new InventoryPage(page),
      cartPage: new CartPage(page),
      checkoutInformationPage: new CheckoutInformationPage(page)
    };

    const openAndLoginAs = createOpenAndLoginAsAction(pages.loginPage);
    const openCart = async (): Promise<void> => {
      await pages.inventoryPage.openCart();
      await pages.cartPage.waitForLoaded();
    };

    const actions: SauceDemoActions = {
      openCart,
      openAndLoginAs,
      loginAsStandardUser: createLoginAsStandardUserAction(pages.loginPage, pages.inventoryPage)
    };

    await use({
      ...pages,
      actions
    });
  }
});

export { expect } from '@playwright/test';
