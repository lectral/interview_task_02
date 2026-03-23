import { type Locator, type Page } from '@playwright/test';

import { PAGE_URLS } from '../test-data/saucedemo.constants';

export type CheckoutInformation = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export class CheckoutInformationPage {
  readonly page: Page;
  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
  }

  async waitForLoaded(): Promise<void> {
    await this.page.waitForURL(PAGE_URLS.checkoutInformation);
  }

  async fillCustomerInformation(information: CheckoutInformation): Promise<void> {
    await this.firstNameInput.fill(information.firstName);
    await this.lastNameInput.fill(information.lastName);
    await this.postalCodeInput.fill(information.postalCode);
  }

  async continueCheckout(): Promise<void> {
    await this.continueButton.click();
  }
}
