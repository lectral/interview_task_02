import { expect, test } from '../fixtures/saucedemo.fixture';

import { PAGE_URLS } from '../test-data/saucedemo.constants';
import { LOGIN_ATTEMPTS, USERS } from '../test-data/users';

test.describe('Sauce Demo login', () => {
  test('logs in successfully with the standard user', async ({ ui, page }) => {
    await ui.actions.openAndLoginAs(USERS.standard);

    await ui.inventoryPage.waitForLoaded();
    await expect(page).toHaveURL(PAGE_URLS.inventory);
    await expect(ui.inventoryPage.title).toBeVisible();
    await expect(ui.inventoryPage.cartLink).toBeVisible();
  });

  test('shows an error for the locked out user and remains on the login page', async ({ ui, page }) => {
    await ui.actions.openAndLoginAs(USERS.lockedOut);

    await expect(ui.loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(PAGE_URLS.login);
    await expect(ui.loginPage.usernameInput).toBeVisible();
    await expect(ui.loginPage.loginButton).toBeVisible();
  });

  test('shows an error for a valid user with an invalid password', async ({ ui, page }) => {
    await ui.actions.openAndLoginAs(LOGIN_ATTEMPTS.standardWithInvalidPassword);

    await expect(ui.loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(PAGE_URLS.login);
    await expect(ui.loginPage.usernameInput).toHaveValue(USERS.standard.username);
    await expect(ui.loginPage.passwordInput).toHaveValue(LOGIN_ATTEMPTS.standardWithInvalidPassword.password);
  });

  test('shows an error for a valid user with an empty password', async ({ ui, page }) => {
    await ui.actions.openAndLoginAs(LOGIN_ATTEMPTS.standardWithEmptyPassword);

    await expect(ui.loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(PAGE_URLS.login);
    await expect(ui.loginPage.usernameInput).toHaveValue(USERS.standard.username);
    await expect(ui.loginPage.passwordInput).toHaveValue(LOGIN_ATTEMPTS.standardWithEmptyPassword.password);
  });
});
