import { expect, test } from '../fixtures/saucedemo.fixture';

import { PAGE_URLS } from '../test-data/saucedemo.constants';
import { PRODUCTS } from '../test-data/products';

test.describe('Sauce Demo cart and checkout', () => {
  test.beforeEach(async ({ ui }) => {
    await ui.actions.loginAsStandardUser();
  });

  test('adds a product to the cart', async ({ ui }) => {
    await ui.inventoryPage.addProductToCart(PRODUCTS.backpack.id);

    await expect(ui.inventoryPage.removeFromCartButton(PRODUCTS.backpack.id)).toBeVisible();
    await expect(ui.inventoryPage.cartBadge).toHaveText('1');

    await ui.actions.openCart();

    await expect(ui.cartPage.title).toBeVisible();
    await expect(ui.cartPage.checkoutButton).toBeVisible();
    await expect(ui.cartPage.cartItem(PRODUCTS.backpack.name)).toBeVisible();
  });

  test('starts the checkout process', async ({ ui, page }) => {
    await ui.inventoryPage.addProductToCart(PRODUCTS.backpack.id);
    await ui.actions.openCart();

    await ui.cartPage.startCheckout();

    await ui.checkoutInformationPage.waitForLoaded();
    await expect(page).toHaveURL(PAGE_URLS.checkoutInformation);
    await expect(ui.checkoutInformationPage.title).toBeVisible();
    await expect(ui.checkoutInformationPage.firstNameInput).toBeVisible();
    await expect(ui.checkoutInformationPage.lastNameInput).toBeVisible();
    await expect(ui.checkoutInformationPage.postalCodeInput).toBeVisible();
  });
});
