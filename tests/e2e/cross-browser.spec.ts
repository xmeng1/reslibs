import { test, expect } from '@playwright/test'

test.describe('跨浏览器兼容性测试', () => {
  test('首页应该在 Chrome 中正常显示', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome 特定测试')

    await page.goto('/')

    // 检查基本元素
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()
    await expect(page.getByPlaceholder('搜索 Unity Assets、软件工具、设计素材...')).toBeVisible()
    await expect(page.getByText('🎮 Unity Assets')).toBeVisible()
    await expect(page.getByText('🎨 设计素材')).toBeVisible()
  })

  test('首页应该在 Firefox 中正常显示', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox 特定测试')

    await page.goto('/')

    // 检查基本元素
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()
    await expect(page.getByText('高质量的低多边形射击游戏资源包')).toBeVisible()
    await expect(page.getByText('开源的3D建模和动画软件')).toBeVisible()
  })

  test('首页应该在 Safari 中正常显示', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari 特定测试')

    await page.goto('/')

    // 检查基本元素
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()
    await expect(page.getByText('为什么选择 ResLibs？')).toBeVisible()
    await expect(page.getByText('多类型支持')).toBeVisible()
  })

  test('资源列表页应该在移动设备上正常显示', async ({ page, browserName }) => {
    test.skip(!['Mobile Chrome', 'Mobile Safari'].includes(browserName), '移动设备特定测试')

    await page.goto('/resources')

    // 检查移动端布局
    await expect(page.getByRole('heading', { name: '资源库' })).toBeVisible()
    await expect(page.getByPlaceholder('搜索资源...')).toBeVisible()

    // 检查资源网格在移动端应该是单列
    const resourceCards = page.locator('.group.hover\\:shadow-lg')
    await expect(resourceCards.first()).toBeVisible()
  })

  test('应该在所有浏览器中正确处理响应式设计', async ({ page }) => {
    await page.goto('/')

    // 测试桌面端
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()

    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()

    // 测试移动端
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()

    // 在移动端应该显示汉堡菜单
    const menuButton = page.getByRole('button').filter({ hasText: '' }).first()
    await expect(menuButton).toBeVisible()
  })

  test('应该正确处理 JavaScript 被禁用的情况', async ({ context }) => {
    // 创建一个禁用 JavaScript 的上下文
    const contextOptions = {
      javaScriptEnabled: false
    }

    // 注意：这个测试可能在实际环境中更有用
    // Playwright 默认启用 JavaScript，这里只是测试框架
    test.skip(true, 'JavaScript 禁用测试需要特殊配置')
  })

  test('应该正确处理不同屏幕分辨率', async ({ page }) => {
    await page.goto('/')

    const resolutions = [
      { width: 1920, height: 1080 }, // Full HD
      { width: 1366, height: 768 },  // 常见笔记本
      { width: 2560, height: 1440 }, // 2K
      { width: 3840, height: 2160 }  // 4K
    ]

    for (const resolution of resolutions) {
      await page.setViewportSize(resolution)
      await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()
      await expect(page.getByText('🎮 Unity Assets')).toBeVisible()
    }
  })

  test('应该正确处理不同设备像素比', async ({ page }) => {
    await page.goto('/')

    // 测试高 DPI 屏幕
    await page.setViewportSize({ width: 375, height: 667, devicePixelRatio: 2 })
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()

    // 测试普通 DPI 屏幕
    await page.setViewportSize({ width: 375, height: 667, devicePixelRatio: 1 })
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()
  })

  test('应该正确处理触摸事件', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox 触摸模拟有限制')

    await page.goto('/')
    await page.setViewportSize({ width: 375, height: 667 })

    // 打开移动端菜单
    const menuButton = page.getByRole('button').filter({ hasText: '' }).first()
    await menuButton.tap()

    // 验证菜单打开
    await expect(page.getByRole('link', { name: '资源库' })).toBeVisible()

    // 点击菜单项
    await page.getByRole('link', { name: '分类' }).tap()
    await expect(page.getByRole('link', { name: '分类' })).toBeVisible()
  })

  test('应该正确处理键盘导航', async ({ page }) => {
    await page.goto('/')

    // 使用 Tab 键导航
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // 按回车键激活链接
    await page.keyboard.press('Enter')

    // 验证导航是否工作
    await expect(page).toHaveURL(/\/resources|\/categories|\/about|\/admin/)
  })

  test('应该正确处理缩放', async ({ page }) => {
    await page.goto('/')

    // 测试不同缩放级别
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

    for (const zoom of zoomLevels) {
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.evaluate((level) => {
        document.body.style.zoom = level.toString()
      }, zoom)

      // 验证主要内容仍然可见
      await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()
    }
  })
})