import { createOpenAndLoginAsAction } from './open-and-login-as.action';
import { type InventoryPage } from '../page-objects/inventory.page';
import { type LoginPage } from '../page-objects/login.page';
import { USERS } from '../test-data/users';

export function createLoginAsStandardUserAction(loginPage: LoginPage, inventoryPage: InventoryPage) {
  const openAndLoginAs = createOpenAndLoginAsAction(loginPage);

  return async (): Promise<void> => {
    await openAndLoginAs(USERS.standard);
    await inventoryPage.waitForLoaded();
  };
}
