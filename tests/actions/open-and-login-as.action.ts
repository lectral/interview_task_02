import { type LoginPage } from '../page-objects/login.page';
import type { UserCredentials } from '../test-data/users';

export function createOpenAndLoginAsAction(loginPage: LoginPage) {
  return async (user: UserCredentials): Promise<void> => {
    await loginPage.goto();
    await loginPage.loginAs(user);
  };
}
