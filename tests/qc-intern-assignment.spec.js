const { test, expect } = require("@playwright/test");

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ username: string, password: string }} credentials
 */
async function login(page, credentials) {
  await page.locator("[data-test='username']").fill(credentials.username);
  await page.locator("[data-test='password']").fill(credentials.password);
  await page.locator("[data-test='login-button']").click();
  await expect(page).toHaveURL(/inventory/);
}

test.describe("SauceDemo — Complete Purchase Flow", () => {
  const credentials = {
    username: "standard_user",
    password: "secret_sauce",
  };

  const checkoutInfo = {
    firstName: "Mohamed",
    lastName: "Mansour",
    postalCode: "516252",
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  //  Test 1: Login with valid credentials
  test("should login with valid credentials", async ({ page }) => {
    await login(page, credentials);
  });

  // Test 2: Add product to cart 
  test("should add the first product to the cart", async ({ page }) => {

    await login(page, credentials);

    const addToCartButton = page.locator(
      "[data-test='add-to-cart-sauce-labs-backpack']"
    );
    await addToCartButton.click();

    const cartBadge = page.locator("[data-test='shopping-cart-badge']");
    await expect(cartBadge).toHaveText("1");
  });

  // Test 3: Proceed to checkout 
  test("should proceed to checkout from the cart", async ({ page }) => {
    await login(page, credentials);
    await page
      .locator("[data-test='add-to-cart-sauce-labs-backpack']")
      .click();
    await expect(page.locator("[data-test='shopping-cart-badge']")).toHaveText(
      "1"
    );

    const cartLink = page.locator("[data-test='shopping-cart-link']");
    await cartLink.click();
    await expect(page).toHaveURL(/cart/);

    const checkoutButton = page.locator("[data-test='checkout']");
    await checkoutButton.click();

    await expect(page).toHaveURL(/checkout-step-one/);
  });

  // Test 4: Fill checkout information 
  test("should fill checkout information and continue", async ({ page }) => {

    await login(page, credentials);
    await page
      .locator("[data-test='add-to-cart-sauce-labs-backpack']")
      .click();
    await page.locator("[data-test='shopping-cart-link']").click();
    await page.locator("[data-test='checkout']").click();
    await expect(page).toHaveURL(/checkout-step-one/);

    const firstNameInput = page.locator("[data-test='firstName']");
    await firstNameInput.fill(checkoutInfo.firstName);

    const lastNameInput = page.locator("[data-test='lastName']");
    await lastNameInput.fill(checkoutInfo.lastName);

    const postalCodeInput = page.locator("[data-test='postalCode']");
    await postalCodeInput.fill(checkoutInfo.postalCode);

    const continueButton = page.locator("[data-test='continue']");
    await continueButton.click();

    await expect(page).toHaveURL(/checkout-step-two/);
  });

  // Test 5: Finish order and verify completion 
  test("should finish order and verify success message", async ({ page }) => {
    await login(page, credentials);
    await page
      .locator("[data-test='add-to-cart-sauce-labs-backpack']")
      .click();
    await page.locator("[data-test='shopping-cart-link']").click();
    await page.locator("[data-test='checkout']").click();
    await page.locator("[data-test='firstName']").fill(checkoutInfo.firstName);
    await page.locator("[data-test='lastName']").fill(checkoutInfo.lastName);
    await page
      .locator("[data-test='postalCode']")
      .fill(checkoutInfo.postalCode);
    await page.locator("[data-test='continue']").click();
    await expect(page).toHaveURL(/checkout-step-two/);

    const finishButton = page.locator("[data-test='finish']");
    await finishButton.click();

    const successMessage = page.locator("[data-test='complete-header']");
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText("Thank you for your order!");

    await expect(page).toHaveURL(/checkout-complete/);
  });
});
