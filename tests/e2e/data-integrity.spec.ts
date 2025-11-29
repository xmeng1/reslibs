import { test, expect, request } from '@playwright/test'

test.describe('ResLibs 数据完整性测试', () => {
  let apiContext: any
  let authToken: string

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: 'http://localhost:3000/api',
    })

    // 获取管理员token
    const loginResponse = await apiContext.post('/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    })
    const loginData = await loginResponse.json()
    authToken = loginData.token
  })

  test.afterAll(async () => {
    await apiContext.dispose()
  })

  test.describe('资源数据完整性', () => {
    test('应该验证资源数据结构的完整性', async ({ page }) => {
      await page.goto('/resources')

      // 检查资源列表是否正确显示
      const resourceCards = page.locator('.resource-card, [data-testid="resource-card"], .group.hover\\:shadow-lg')

      if (await resourceCards.count() > 0) {
        const firstCard = resourceCards.first()

        // 验证资源卡片的基本元素
        await expect(firstCard).toBeVisible()

        // 检查资源名称
        const resourceName = firstCard.locator('h3, .resource-name, .font-bold')
        if (await resourceName.count() > 0) {
          const nameText = await resourceName.first().textContent()
          expect(nameText?.trim()).toBeTruthy()
          expect(nameText!.length).toBeGreaterThan(0)
        }

        // 检查资源描述
        const resourceDesc = firstCard.locator('p, .resource-description, .text-gray-600')
        if (await resourceDesc.count() > 0) {
          const descText = await resourceDesc.first().textContent()
          expect(descText?.trim()).toBeTruthy()
        }

        // 检查资源类型标签
        const resourceType = firstCard.locator('[data-type], .resource-type, .badge')
        if (await resourceType.count() > 0) {
          await expect(resourceType.first()).toBeVisible()
        }
      }
    })

    test('应该验证资源详情页面的数据完整性', async ({ page }) => {
      await page.goto('/resources/1')

      // 检查页面是否包含必要的资源信息
      await expect(page.locator('body')).toBeVisible()

      // 查找资源详情相关元素
      const resourceTitle = page.locator('h1, .resource-title, .resource-name')
      if (await resourceTitle.count() > 0) {
        const title = await resourceTitle.first().textContent()
        expect(title?.trim()).toBeTruthy()
        expect(title!.length).toBeGreaterThan(0)
      }

      // 检查资源描述
      const resourceDescription = page.locator('.resource-description, .description, .text-lg')
      if (await resourceDescription.count() > 0) {
        const description = await resourceDescription.first().textContent()
        expect(description?.trim()).toBeTruthy()
      }

      // 检查元数据
      const metadataElements = page.locator('.metadata, .resource-meta, .flex.items-center.gap-4')
      if (await metadataElements.count() > 0) {
        await expect(metadataElements.first()).toBeVisible()
      }
    })

    test('应该验证API返回的资源数据结构', async () => {
      const response = await apiContext.get('/resources')
      expect(response.status()).toBe(200)

      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('resources')

      const resources = responseData.data.resources

      if (resources.length > 0) {
        const firstResource = resources[0]

        // 验证资源对象的数据结构
        expect(firstResource).toHaveProperty('id')
        expect(firstResource).toHaveProperty('name')
        expect(firstResource).toHaveProperty('description')
        expect(firstResource).toHaveProperty('type')
        expect(typeof firstResource.id).toBe('number')
        expect(typeof firstResource.name).toBe('string')
        expect(typeof firstResource.description).toBe('string')
        expect(typeof firstResource.type).toBe('string')

        // 验证数据不为空
        expect(firstResource.name.trim()).toBeTruthy()
        expect(firstResource.name.length).toBeGreaterThan(0)
      }
    })

    test('应该验证分页数据的一致性', async () => {
      const page1Response = await apiContext.get('/resources?page=1&limit=5')
      const page2Response = await apiContext.get('/resources?page=2&limit=5')

      expect(page1Response.status()).toBe(200)
      expect(page2Response.status()).toBe(200)

      const page1Data = await page1Response.json()
      const page2Data = await page2Response.json()

      // 验证分页信息
      expect(page1Data.data).toHaveProperty('pagination')
      expect(page2Data.data).toHaveProperty('pagination')

      const page1Pagination = page1Data.data.pagination
      const page2Pagination = page2Data.data.pagination

      expect(page1Pagination.page).toBe(1)
      expect(page2Pagination.page).toBe(2)

      // 验证两页的数据不重复
      if (page1Data.data.resources.length > 0 && page2Data.data.resources.length > 0) {
        const page1Ids = page1Data.data.resources.map((r: any) => r.id)
        const page2Ids = page2Data.data.resources.map((r: any) => r.id)

        const duplicateIds = page1Ids.filter((id: number) => page2Ids.includes(id))
        expect(duplicateIds.length).toBe(0)
      }
    })
  })

  test.describe('分类数据完整性', () => {
    test('应该验证分类数据的完整性', async ({ page }) => {
      await page.goto('/categories')

      // 检查分类页面是否正确显示
      await expect(page.locator('body')).toBeVisible()

      // 查找分类卡片或列表
      const categoryCards = page.locator('.category-card, [data-testid="category"], .bg-white.p-6.rounded-lg')

      if (await categoryCards.count() > 0) {
        const firstCard = categoryCards.first()

        // 验证分类卡片的基本元素
        await expect(firstCard).toBeVisible()

        // 检查分类名称
        const categoryName = firstCard.locator('h3, .category-name, .font-semibold')
        if (await categoryName.count() > 0) {
          const nameText = await categoryName.first().textContent()
          expect(nameText?.trim()).toBeTruthy()
          expect(nameText!.length).toBeGreaterThan(0)
        }

        // 检查分类描述
        const categoryDesc = firstCard.locator('p, .category-description, .text-gray-600')
        if (await categoryDesc.count() > 0) {
          const descText = await categoryDesc.first().textContent()
          expect(descText?.trim()).toBeTruthy()
        }
      }
    })

    test('应该验证分类与资源的关联性', async () => {
      // 获取分类列表
      const categoriesResponse = await apiContext.get('/categories')
      expect(categoriesResponse.status()).toBe(200)

      const categoriesData = await categoriesResponse.json()
      const categories = categoriesData.data

      if (categories.length > 0) {
        // 选择一个分类
        const firstCategory = categories[0]
        expect(firstCategory).toHaveProperty('id')
        expect(firstCategory).toHaveProperty('name')

        // 获取该分类下的资源
        const categoryResourcesResponse = await apiContext.get(`/resources?categoryId=${firstCategory.id}`)

        // 如果接口返回数据，验证资源的分类属性
        if (categoryResourcesResponse.status() === 200) {
          const categoryResourcesData = await categoryResourcesResponse.json()

          if (categoryResourcesData.data.resources.length > 0) {
            const firstResource = categoryResourcesData.data.resources[0]
            expect(firstResource).toHaveProperty('categoryId', firstCategory.id)
          }
        }
      }
    })

    test('应该验证API返回的分类数据结构', async () => {
      const response = await apiContext.get('/categories')
      expect(response.status()).toBe(200)

      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')

      const categories = responseData.data

      if (categories.length > 0) {
        const firstCategory = categories[0]

        // 验证分类对象的数据结构
        expect(firstCategory).toHaveProperty('id')
        expect(firstCategory).toHaveProperty('name')
        expect(firstCategory).toHaveProperty('description')
        expect(typeof firstCategory.id).toBe('number')
        expect(typeof firstCategory.name).toBe('string')
        expect(typeof firstCategory.description).toBe('string')

        // 验证数据不为空
        expect(firstCategory.name.trim()).toBeTruthy()
        expect(firstCategory.name.length).toBeGreaterThan(0)
      }
    })
  })

  test.describe('用户数据完整性', () => {
    test('应该验证用户登录数据的一致性', async () => {
      const loginResponse = await apiContext.post('/auth/login', {
        data: {
          username: 'admin',
          password: 'admin123456'
        }
      })

      expect(loginResponse.status()).toBe(200)

      const loginData = await loginResponse.json()
      expect(loginData).toHaveProperty('success', true)
      expect(loginData).toHaveProperty('token')
      expect(loginData).toHaveProperty('user')

      // 验证用户数据结构
      expect(loginData.user).toHaveProperty('username', 'admin')
      expect(loginData.user).toHaveProperty('id')
      expect(typeof loginData.user.id).toBe('number')
      expect(typeof loginData.token).toBe('string')
      expect(loginData.token.length).toBeGreaterThan(0)
    })

    test('应该验证用户会话数据的持久性', async ({ page }) => {
      // 登录管理后台
      await page.goto('/admin')
      await page.getByLabel('用户名').fill('admin')
      await page.getByLabel('密码').fill('admin123456')
      await page.getByRole('button', { name: '登录' }).click()

      await page.waitForTimeout(2000)

      // 导航到不同的管理页面
      await page.goto('/admin/dashboard')
      await page.goto('/admin/resources')

      // 检查是否仍然保持登录状态
      const currentUrl = page.url()
      expect(currentUrl).toContain('/admin/resources')
    })
  })

  test.describe('搜索数据完整性', () => {
    test('应该验证搜索结果的数据完整性', async () => {
      const searchResponse = await apiContext.get('/search?q=Unity')
      expect(searchResponse.status()).toBe(200)

      const searchData = await searchResponse.json()
      expect(searchData).toHaveProperty('success', true)
      expect(searchData).toHaveProperty('data')
      expect(searchData.data).toHaveProperty('results')
      expect(searchData.data).toHaveProperty('pagination')

      const results = searchData.data.results

      if (results.length > 0) {
        const firstResult = results[0]

        // 验证搜索结果的数据结构
        expect(firstResult).toHaveProperty('id')
        expect(firstResult).toHaveProperty('name')
        expect(firstResult).toHaveProperty('description')
        expect(firstResult).toHaveProperty('type')

        // 验证搜索词在结果中的体现
        const searchFields = [
          firstResult.name?.toLowerCase() || '',
          firstResult.description?.toLowerCase() || '',
          (firstResult.tags || []).join(' ').toLowerCase()
        ].join(' ')

        expect(searchFields).toContain('unity'.toLowerCase())
      }
    })

    test('应该验证搜索建议的数据完整性', async () => {
      const suggestionsResponse = await apiContext.get('/search/suggestions?q=Uni')
      expect(suggestionsResponse.status()).toBe(200)

      const suggestionsData = await suggestionsResponse.json()
      expect(suggestionsData).toHaveProperty('success', true)
      expect(suggestionsData).toHaveProperty('data')
      expect(Array.isArray(suggestionsData.data)).toBe(true)

      const suggestions = suggestionsData.data

      if (suggestions.length > 0) {
        // 验证每个建议都是有效的字符串
        suggestions.forEach((suggestion: any) => {
          expect(typeof suggestion).toBe('string')
          expect(suggestion.trim()).toBeTruthy()
          expect(suggestion.length).toBeGreaterThan(0)
          expect(suggestion.toLowerCase()).toContain('uni'.toLowerCase())
        })
      }
    })
  })

  test.describe('数据一致性检查', () => {
    test('应该验证前端显示与后端数据的一致性', async ({ page }) => {
      // 获取API数据
      const apiResponse = await apiContext.get('/resources')
      const apiData = await apiResponse.json()

      // 访问前端页面
      await page.goto('/resources')

      // 检查页面是否显示相同数量的资源（考虑分页）
      const resourceCards = page.locator('.resource-card, [data-testid="resource-card"], .group.hover\\:shadow-lg')
      const frontendCount = await resourceCards.count()

      // API返回的数据数量应该大于等于前端显示的数量
      expect(apiData.data.resources.length).toBeGreaterThanOrEqual(frontendCount)

      if (frontendCount > 0) {
        // 验证第一个资源的名称是否一致
        const firstCard = resourceCards.first()
        const frontendName = await firstCard.locator('h3, .resource-name, .font-bold').first().textContent()
        const apiName = apiData.data.resources[0].name

        if (frontendName && apiName) {
          expect(frontendName.trim()).toBe(apiName.trim())
        }
      }
    })

    test('应该验证统计数据的一致性', async () => {
      const statsResponse = await apiContext.get('/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (statsResponse.status() === 200) {
        const statsData = await statsResponse.json()
        expect(statsData).toHaveProperty('success', true)
        expect(statsData).toHaveProperty('data')

        const stats = statsData.data

        // 验证统计数据的数据类型
        expect(stats).toHaveProperty('totalResources')
        expect(stats).toHaveProperty('totalDownloads')
        expect(stats).toHaveProperty('totalUsers')
        expect(stats).toHaveProperty('todayNew')

        expect(typeof stats.totalResources).toBe('number')
        expect(typeof stats.totalDownloads).toBe('number')
        expect(typeof stats.totalUsers).toBe('number')
        expect(typeof stats.todayNew).toBe('number')

        // 验证统计数据为非负数
        expect(stats.totalResources).toBeGreaterThanOrEqual(0)
        expect(stats.totalDownloads).toBeGreaterThanOrEqual(0)
        expect(stats.totalUsers).toBeGreaterThanOrEqual(0)
        expect(stats.todayNew).toBeGreaterThanOrEqual(0)
      }
    })
  })

  test.describe('数据边界和异常测试', () => {
    test('应该正确处理空数据集', async () => {
      // 测试空搜索结果
      const emptySearchResponse = await apiContext.get('/search?q=nonexistent12345')
      expect(emptySearchResponse.status()).toBe(200)

      const emptySearchData = await emptySearchResponse.json()
      expect(emptySearchData).toHaveProperty('success', true)
      expect(emptySearchData.data.results.length).toBe(0)
    })

    test('应该正确处理数据边界值', async () => {
      // 测试大数字分页
      const largePageResponse = await apiContext.get('/resources?page=999999')
      expect(largePageResponse.status()).toBe(200)

      // 测试负数参数
      const negativePageResponse = await apiContext.get('/resources?page=-1')
      expect([200, 400]).toContain(negativePageResponse.status())

      // 测试零值参数
      const zeroPageResponse = await apiContext.get('/resources?page=0')
      expect([200, 400]).toContain(zeroPageResponse.status())
    })

    test('应该验证数据的类型安全性', async () => {
      const response = await apiContext.get('/resources')
      const responseData = await response.json()

      const resources = responseData.data.resources

      if (resources.length > 0) {
        const firstResource = resources[0]

        // 验证ID为正整数
        expect(Number.isInteger(firstResource.id)).toBe(true)
        expect(firstResource.id).toBeGreaterThan(0)

        // 验证名称为字符串且长度合理
        expect(typeof firstResource.name).toBe('string')
        expect(firstResource.name.length).toBeGreaterThan(0)
        expect(firstResource.name.length).toBeLessThan(1000) // 合理的长度限制

        // 验证描述长度
        expect(typeof firstResource.description).toBe('string')
        expect(firstResource.description.length).toBeLessThan(10000) // 合理的长度限制
      }
    })

    test('应该验证数据关系的完整性', async () => {
      // 获取一个资源
      const resourceResponse = await apiContext.get('/resources/1')

      if (resourceResponse.status() === 200) {
        const resourceData = await resourceResponse.json()
        const resource = resourceData.data

        if (resource.categoryId) {
          // 验证分类是否存在
          const categoryResponse = await apiContext.get(`/categories/${resource.categoryId}`)

          // 分类可能存在也可能不存在，但API应该正确处理
          expect([200, 404]).toContain(categoryResponse.status())
        }

        // 验证下载量为非负数
        if (resource.downloadCount !== undefined) {
          expect(typeof resource.downloadCount).toBe('number')
          expect(resource.downloadCount).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })
})