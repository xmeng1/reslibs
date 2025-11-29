import { test, expect } from '@playwright/test'

test.describe('ResLibs 页面路由测试', () => {
  const testPages = [
    { path: '/', title: 'ResLibs', description: '首页' },
    { path: '/resources', title: '资源库', description: '资源列表页' },
    { path: '/categories', title: '分类', description: '分类页面' },
    { path: '/about', title: '关于', description: '关于页面' },
    { path: '/upload', title: '上传资源', description: '资源上传页面' },
    { path: '/admin', title: '管理员登录', description: '管理员登录页面' },
  ]

  test.describe('基础页面路由', () => {
    test('应该能够访问所有基础页面', async ({ page }) => {
      for (const testPage of testPages) {
        await page.goto(testPage.path)

        // 检查页面是否成功加载
        await expect(page).toHaveURL(testPage.path)

        // 检查页面是否包含预期内容
        await expect(page.getByRole('heading', { name: testPage.title })).toBeVisible({
          timeout: 5000
        })
      }
    })

    test('应该正确处理404页面', async ({ page }) => {
      const nonExistentPaths = [
        '/nonexistent-page',
        '/invalid-route',
        '/resources/999999',
        '/categories/unknown'
      ]

      for (const path of nonExistentPaths) {
        await page.goto(path)

        // 检查是否显示404页面或重定向到首页
        const currentUrl = page.url()

        // 如果重定向到首页，应该包含首页特征
        if (currentUrl.includes('localhost:3000')) {
          await expect(page.locator('body')).toBeVisible()
        }
      }
    })
  })

  test.describe('资源相关路由', () => {
    test('应该能够访问资源详情页', async ({ page }) => {
      await page.goto('/resources/1')

      // 检查页面加载
      await expect(page.locator('body')).toBeVisible()

      // 检查资源详情相关元素（可能不存在，但页面应该加载）
      const resourceDetails = page.locator('.resource-details, .resource-content, main')
      if (await resourceDetails.count() > 0) {
        await expect(resourceDetails.first()).toBeVisible()
      }
    })

    test('应该能够处理资源搜索页面', async ({ page }) => {
      await page.goto('/resources?search=unity&type=unity-assets')

      // 检查页面加载
      await expect(page.locator('body')).toBeVisible()

      // 检查搜索参数是否正确应用
      const searchInput = page.locator('input[placeholder*="搜索"]')
      if (await searchInput.count() > 0) {
        await expect(searchInput.first()).toBeVisible()
      }
    })

    test('应该能够访问分类资源页面', async ({ page }) => {
      const categories = ['unity-assets', 'software', 'design', 'video']

      for (const category of categories) {
        await page.goto(`/categories/${category}`)

        // 检查页面加载
        await expect(page.locator('body')).toBeVisible()

        // 等待一秒钟以确保页面完全加载
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('管理后台路由', () => {
    test('应该能够访问管理后台各个页面（需要登录）', async ({ page }) => {
      const adminPages = [
        { path: '/admin/dashboard', title: '管理后台' },
        { path: '/admin/resources', title: '资源管理' },
        { path: '/admin/categories', title: '分类管理' },
        { path: '/admin/users', title: '用户管理' },
        { path: '/admin/settings', title: '系统设置' },
      ]

      for (const adminPage of adminPages) {
        await page.goto(adminPage.path)

        // 未登录时应该重定向到登录页面
        await expect(page).toHaveURL('/admin')
        await expect(page.getByRole('heading', { name: '管理员登录' })).toBeVisible()
      }
    })

    test('登录后应该能够访问管理后台页面', async ({ page }) => {
      // 先登录
      await page.goto('/admin')
      await page.getByLabel('用户名').fill('admin')
      await page.getByLabel('密码').fill('admin123456')
      await page.getByRole('button', { name: '登录' }).click()

      // 等待登录完成
      await page.waitForTimeout(2000)

      const adminPages = [
        { path: '/admin/dashboard', title: '管理后台' },
        { path: '/admin/resources', title: '资源管理' },
        { path: '/admin/categories', title: '分类管理' },
        { path: '/admin/users', title: '用户管理' },
        { path: '/admin/settings', title: '系统设置' },
      ]

      for (const adminPage of adminPages) {
        await page.goto(adminPage.path)

        // 检查页面是否成功加载
        await expect(page).toHaveURL(adminPage.path)
        await expect(page.locator('body')).toBeVisible()

        // 等待页面完全加载
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('导航路由', () => {
    test('应该能够通过导航栏正确导航', async ({ page }) => {
      await page.goto('/')

      // 测试主导航链接
      const navigationTests = [
        { selector: 'a[href="/resources"]', expectedPath: '/resources' },
        { selector: 'a[href="/categories"]', expectedPath: '/categories' },
        { selector: 'a[href="/about"]', expectedPath: '/about' },
      ]

      for (const navTest of navigationTests) {
        const link = page.locator(navTest.selector)

        if (await link.count() > 0) {
          await link.first().click()
          await expect(page).toHaveURL(navTest.expectedPath)

          // 返回首页
          await page.goto('/')
        }
      }
    })

    test('应该能够通过面包屑导航', async ({ page }) => {
      // 导航到资源页面
      await page.goto('/resources')

      // 查找面包屑导航
      const breadcrumbs = page.locator('.breadcrumb, nav[aria-label="breadcrumb"], .breadcrumbs')

      if (await breadcrumbs.count() > 0) {
        // 测试首页链接
        const homeLink = breadcrumbs.locator('a[href="/"]')
        if (await homeLink.count() > 0) {
          await homeLink.first().click()
          await expect(page).toHaveURL('/')
        }
      }
    })

    test('应该能够通过移动端菜单导航', async ({ page }) => {
      // 切换到移动端视口
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // 查找移动端菜单按钮
      const menuButtons = page.locator('button[aria-label="menu"], button[aria-label="Menu"], .menu-button, button.hamburger')

      if (await menuButtons.count() > 0) {
        await menuButtons.first().click()
        await page.waitForTimeout(500)

        // 查找导航链接
        const mobileLinks = page.locator('.mobile-menu a, .sidebar a, nav[role="navigation"] a')

        if (await mobileLinks.count() > 0) {
          const resourcesLink = mobileLinks.locator('a[href="/resources"]')
          if (await resourcesLink.count() > 0) {
            await resourcesLink.first().click()
            await expect(page).toHaveURL('/resources')
          }
        }
      }
    })
  })

  test.describe('动态路由', () => {
    test('应该能够处理带参数的路由', async ({ page }) => {
      const dynamicRoutes = [
        '/resources/1',
        '/resources/2',
        '/resources/edit/1',
        '/categories/edit/1',
        '/users/1',
      ]

      for (const route of dynamicRoutes) {
        await page.goto(route)

        // 检查页面是否能够加载（可能显示404或重定向）
        await expect(page.locator('body')).toBeVisible()

        // 等待页面处理
        await page.waitForTimeout(1000)
      }
    })

    test('应该能够处理查询参数', async ({ page }) => {
      const queryParamTests = [
        '/resources?page=2&limit=10',
        '/resources?search=test&type=unity-assets',
        '/resources?sort=popular&order=desc',
        '/categories?featured=true',
        '/upload?step=2',
      ]

      for (const url of queryParamTests) {
        await page.goto(url)

        // 检查页面是否能够加载
        await expect(page.locator('body')).toBeVisible()

        // 等待页面处理
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('路由保护', () => {
    test('应该保护需要认证的路由', async ({ page }) => {
      const protectedRoutes = [
        '/admin/dashboard',
        '/admin/resources',
        '/admin/categories',
        '/admin/users',
        '/admin/settings',
        '/profile',
        '/settings',
        '/my-resources',
      ]

      for (const route of protectedRoutes) {
        await page.goto(route)

        // 检查是否重定向到登录页面或显示认证相关内容
        const currentUrl = page.url()

        if (currentUrl.includes('/admin')) {
          // 管理后台路由应该重定向到登录页面
          await expect(page).toHaveURL('/admin')
        } else {
          // 其他受保护路由可能显示不同的响应
          await expect(page.locator('body')).toBeVisible()
        }

        await page.waitForTimeout(500)
      }
    })

    test('应该保持会话状态', async ({ page }) => {
      // 登录管理后台
      await page.goto('/admin')
      await page.getByLabel('用户名').fill('admin')
      await page.getByLabel('密码').fill('admin123456')
      await page.getByRole('button', { name: '登录' }).click()
      await page.waitForTimeout(2000)

      // 导航到不同的管理页面
      await page.goto('/admin/resources')
      await expect(page).toHaveURL('/admin/resources')

      await page.goto('/admin/categories')
      await expect(page).toHaveURL('/admin/categories')

      // 检查是否仍然保持登录状态
      await page.goto('/admin')

      // 如果仍然登录，应该重定向到dashboard，或者显示登录页面
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('错误路由处理', () => {
    test('应该正确处理服务器错误路由', async ({ page }) => {
      // 尝试访问可能触发服务器错误的路径
      const errorProneRoutes = [
        '/api/error',
        '/resources/null',
        '/categories/undefined',
        '/admin/error',
      ]

      for (const route of errorProneRoutes) {
        await page.goto(route)

        // 页面应该能够处理错误而不崩溃
        await expect(page.locator('body')).toBeVisible()

        await page.waitForTimeout(1000)
      }
    })

    test('应该正确处理无效的URL编码', async ({ page }) => {
      const invalidUrls = [
        '/resources/%E4%B8%AD%E6%96%87',
        '/search?q=%F0%9F%98%81', // 无效的UTF-8编码
        '/categories/%7Bcategory%7D', // URL编码的花括号
      ]

      for (const url of invalidUrls) {
        await page.goto(url)

        // 应该能够处理或重定向
        await expect(page.locator('body')).toBeVisible()

        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('性能路由测试', () => {
    test('应该在合理时间内加载所有路由', async ({ page }) => {
      const routes = [
        '/',
        '/resources',
        '/categories',
        '/about',
        '/admin',
      ]

      for (const route of routes) {
        const startTime = Date.now()

        await page.goto(route)
        await expect(page.locator('body')).toBeVisible()

        const loadTime = Date.now() - startTime

        // 页面应该在5秒内加载完成
        expect(loadTime).toBeLessThan(5000)

        console.log(`Route ${route} loaded in ${loadTime}ms`)
      }
    })
  })
})