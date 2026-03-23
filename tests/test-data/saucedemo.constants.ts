export const SAUCE_DEMO_BASE_URL = 'https://www.saucedemo.com';

export const PAGE_PATHS = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
  checkoutInformation: '/checkout-step-one.html'
} as const;

export const PAGE_URLS = {
  login: `${SAUCE_DEMO_BASE_URL}${PAGE_PATHS.login}`,
  inventory: `${SAUCE_DEMO_BASE_URL}${PAGE_PATHS.inventory}`,
  cart: `${SAUCE_DEMO_BASE_URL}${PAGE_PATHS.cart}`,
  checkoutInformation: `${SAUCE_DEMO_BASE_URL}${PAGE_PATHS.checkoutInformation}`
} as const;
