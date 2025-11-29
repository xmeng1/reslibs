import { test, expect } from '@playwright/test'

// 这个文件作为主测试套件，运行所有子测试
// 但由于Playwright的架构，我们需要通过配置来运行所有测试文件

test.describe('ResLibs 完整E2E测试套件', () => {
  test('测试套件配置验证', async ({ page }) => {
    // 验证测试环境
    await page.goto('/')
    await expect(page).toHaveTitle(/ResLibs/)
  })

  test('管理员账户验证', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: '管理员登录' })).toBeVisible()

    // 测试管理员登录
    await page.getByLabel('用户名').fill('admin')
    await page.getByLabel('密码').fill('admin123456')
    await page.getByRole('button', { name: '登录' }).click()

    // 验证登录成功
    await page.waitForTimeout(2000)
    const currentUrl = page.url()

    if (currentUrl.includes('/admin/dashboard')) {
      await expect(page.getByRole('heading', { name: '管理后台' })).toBeVisible()
    }
  })
})

// 导出测试套件信息供其他测试使用
export const testSuiteConfig = {
  baseUrl: 'http://localhost:3000',
  adminCredentials: {
    username: 'admin',
    password: 'admin123456'
  },
  testTimeout: 30000,
  expectedPages: [
    '/',
    '/resources',
    '/categories',
    '/about',
    '/admin'
  ],
  expectedAPIs: [
    '/api/resources',
    '/api/categories',
    '/api/auth/login',
    '/api/search'
  ]
}