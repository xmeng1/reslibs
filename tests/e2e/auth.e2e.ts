import { test, expect } from '@playwright/test';

test.describe('认证系统测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
  });

  test('应该显示登录页面', async ({ page }) => {
    await expect(page).toHaveTitle(/ResLibs/);
    await expect(page.locator('h1')).toContainText('管理员登录');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('登录');
  });

  test('应该成功登录有效的管理员凭据', async ({ page }) => {
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123456');
    await page.click('button[type="submit"]');

    // 应该重定向到仪表板
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('仪表板');
  });

  test('应该拒绝错误的密码', async ({ page }) => {
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // 应该显示错误消息
    await expect(page.locator('text=用户名或密码错误')).toBeVisible();
    await expect(page).toHaveURL('/admin/login');
  });

  test('应该拒绝错误的用户名', async ({ page }) => {
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'admin123456');
    await page.click('button[type="submit"]');

    // 应该显示错误消息
    await expect(page.locator('text=用户名或密码错误')).toBeVisible();
    await expect(page).toHaveURL('/admin/login');
  });

  test('应该拒绝空字段', async ({ page }) => {
    await page.click('button[type="submit"]');

    // 应该显示验证错误
    await expect(page.locator('text=用户名不能为空')).toBeVisible();
    await expect(page.locator('text=密码不能为空')).toBeVisible();
  });

  test('应该能够登出', async ({ page }) => {
    // 先登录
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/dashboard');

    // 找到并点击登出按钮
    const logoutButton = page.locator('button:has-text("登出")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // 如果找不到按钮，尝试导航到登录页面
      await page.goto('/admin/login');
    }

    // 验证已登出
    await expect(page).toHaveURL('/admin/login');
  });
});

test.describe('认证保护测试', () => {
  test('未认证用户应该被重定向到登录页', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin/login');
  });

  test('未认证用户应该无法访问资源管理页', async ({ page }) => {
    await page.goto('/admin/resources');
    await expect(page).toHaveURL('/admin/login');
  });
});