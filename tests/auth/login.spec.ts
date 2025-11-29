import { test, expect } from '@playwright/test'

test.describe('管理员登录功能', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页面
    await page.goto('/admin/login')
  })

  test('登录页面应该正确加载', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/ResLibs/)

    // 检查页面元素
    await expect(page.locator('h1')).toContainText('ResLibs')
    await expect(page.locator('h2')).toContainText('管理后台')
    await expect(page.locator('text=管理员登录')).toBeVisible()

    // 检查表单元素
    await expect(page.locator('label[for="username"]')).toContainText('用户名或邮箱')
    await expect(page.locator('label[for="password"]')).toContainText('密码')
    await expect(page.locator('button[type="submit"]')).toContainText('登录')

    // 检查默认账户信息显示
    await expect(page.locator('text=默认账户')).toBeVisible()
    await expect(page.locator('code:has-text("admin")')).toBeVisible()
    await expect(page.locator('code:has-text("admin123456")')).toBeVisible()
  })

  test('应该能够成功登录', async ({ page }) => {
    // 输入登录信息
    await page.fill('input[id="username"]', 'admin')
    await page.fill('input[id="password"]', 'admin123456')

    // 点击登录按钮
    await page.click('button[type="submit"]')

    // 等待页面跳转
    await page.waitForURL('/admin/dashboard')

    // 验证登录成功
    await expect(page).toHaveURL('/admin/dashboard')
    await expect(page.locator('h1')).toContainText('仪表板')

    // 验证用户信息显示
    await expect(page.locator('text=欢迎回来')).toBeVisible()
    await expect(page.locator('text=系统管理员')).toBeVisible()
  })

  test('应该显示错误信息当密码错误时', async ({ page }) => {
    // 输入错误的密码
    await page.fill('input[id="username"]', 'admin')
    await page.fill('input[id="password"]', 'wrongpassword')

    // 点击登录按钮
    await page.click('button[type="submit"]')

    // 验证错误信息显示
    await expect(page.locator('text=登录失败: 密码错误')).toBeVisible()

    // 确保仍在登录页面
    await expect(page).toHaveURL('/admin/login')
  })

  test('应该显示错误信息当用户不存在时', async ({ page }) => {
    // 输入不存在的用户名
    await page.fill('input[id="username"]', 'nonexistent')
    await page.fill('input[id="password"]', 'password123')

    // 点击登录按钮
    await page.click('button[type="submit"]')

    // 验证错误信息显示
    await expect(page.locator('text=登录失败: 用户不存在或已被禁用')).toBeVisible()

    // 确保仍在登录页面
    await expect(page).toHaveURL('/admin/login')
  })

  test('应该显示错误信息当表单为空时', async ({ page }) => {
    // 点击登录按钮但不填写表单
    await page.click('button[type="submit"]')

    // 验证浏览器原生验证
    const usernameInput = page.locator('input[id="username"]')
    const passwordInput = page.locator('input[id="password"]')

    await expect(usernameInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('密码可见性切换功能', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]')
    const toggleButton = page.locator('button:has([data-lucide="eye"])')

    // 初始状态应该是隐藏密码
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // 点击切换按钮应该显示密码
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // 再次点击应该隐藏密码
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('返回首页链接', async ({ page }) => {
    // 点击返回首页链接
    await page.click('a:has-text("返回首页")')

    // 验证跳转到首页
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('ResLibs')
  })
})

test.describe('登录后功能', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    // 先登录获取token
    const loginResponse = await page.request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    })

    const { token } = await loginResponse.json()

    // 设置认证token
    await page.evaluate((authToken) => {
      localStorage.setItem('admin_token', authToken)
    }, token.data.token)
  })

  test('应该能够访问仪表板', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // 验证仪表板内容
    await expect(page.locator('h1')).toContainText('仪表板')
    await expect(page.locator('text=总资源数')).toBeVisible()
    await expect(page.locator('text=已发布')).toBeVisible()
    await expect(page.locator('text=总下载量')).toBeVisible()
    await expect(page.locator('text=总浏览量')).toBeVisible()
  })

  test('应该能够访问资源管理页面', async ({ page }) => {
    await page.goto('/admin/resources')

    // 验证资源管理页面内容
    await expect(page.locator('h1')).toContainText('资源管理')
    await expect(page.locator('text=资源列表')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('应该能够退出登录', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // 点击退出按钮
    await page.click('button:has-text("退出")')

    // 验证跳转到登录页面
    await expect(page).toHaveURL('/admin/login')

    // 验证localStorage被清除
    const token = await page.evaluate(() => localStorage.getItem('admin_token'))
    expect(token).toBeNull()
  })

  test('未认证用户应该被重定向到登录页', async ({ page }) => {
    // 不带认证token直接访问管理页面
    await page.goto('/admin/dashboard')

    // 应该被重定向到登录页面
    await expect(page).toHaveURL('/admin/login')
  })
})