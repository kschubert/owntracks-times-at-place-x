import { expect, test } from '@playwright/test';

const monthNames = [ 
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

test('has title', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/React App/);
});

test('choose date', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await expect(page.getByRole('listbox', { name: /month \d\d\d\d-\d\d/ })).toBeHidden();

  // Click the datePicker button.
  await page.locator('#datePicker').click();

  const monthListBox = page.getByRole('listbox', { name: /month \d\d\d\d-\d\d/ });
  // Expects page to have a heading with the name of Installation.
  await expect(monthListBox).toBeVisible();
  const labelYearMonth = await monthListBox.getAttribute('aria-label');
  expect(labelYearMonth).toMatch(/month\s+\d\d\d\d-\d\d/);
  const matchResult = labelYearMonth!.match(/month\s+(\d\d\d\d)-(\d\d)/);
  const year = matchResult![1];
  const month = matchResult![2];

  const iMonth = parseInt(month) - 1;
  const newPickDate = monthNames[iMonth < 12 ? iMonth + 1 : iMonth - 1] + ' ' + year;
  const optionToClick = page.getByRole('listbox', { name: /month \d\d\d\d-\d\d/ }).getByRole('option', { name: 'Choose ' + newPickDate });
  await expect(optionToClick).toBeVisible()
  await optionToClick.click();
});
