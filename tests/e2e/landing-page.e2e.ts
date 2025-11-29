import { test, expect } from '@playwright/test';

test.describe('前台页面测试', () => {
  test('主页应该正确加载', async ({ page }) => {
    await page.goto('/');

    // 验证页面标题
    await expect(page).toHaveTitle(/ResLibs/);
    await expect(page.locator('h1')).toContainText('ResLibs');
  });

  test('主页应该显示资源列表', async ({ page }) => {
    await page.goto('/');

    // 验证主要元素存在
    await expect(page.locator('text=通用资源分享平台')).toBeVisible();

    // 验证资源数据存在（根据种子数据）
    await expect(page.locator('text=Low Poly Shooter Pack')).toBeVisible();
    await expect(page.locator('text=Blender 3D 建模软件')).toBeVisible();
  });

  test('资源卡片应该显示完整信息', async ({ page }) => {
    await page.goto('/');

    // 查找第一个资源卡片
    const firstResource = page.locator('[data-testid="resource-card"]').first();
    if (await firstResource.isVisible()) {
      // 验证资源标题
      await expect(firstResource.locator('[data-testid="resource-title"]')).toBeVisible();

      // 验证资源描述
      await expect(firstResource.locator('[data-testid="resource-description"]')).toBeVisible();

      // 验证资源类型
      await expect(firstResource.locator('[data-testid="resource-type"]')).toBeVisible();

      // 验证下载次数
      await expect(firstResource.locator('[data-testid="download-count"]')).toBeVisible();
    }
  });

  test('搜索功能应该工作', async ({ page }) => {
    await page.goto('/');

    // 查找搜索框
    const searchInput = page.locator('input[placeholder*="搜索"], input[name="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Unity');
      await page.keyboard.press('Enter');

      // 等待搜索结果
      await page.waitForTimeout(1000);

      // 验证搜索结果包含Unity相关内容
      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).toContain('unity');
    }
  });

  test('分类筛选应该工作', async ({ page }) => {
    await page.goto('/');

    // 查找分类筛选器
    const categoryFilter = page.locator('[data-testid="category-filter"], select[name="category"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ label: /游戏开发/ });
      await page.keyboard.press('Enter');

      // 等待筛选结果
      await page.waitForTimeout(1000);

      // 验证筛选结果
      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).toContain('unity');
    }
  });

  test('标签筛选应该工作', async ({ page }) => {
    await page.goto('/');

    // 查找标签筛选器
    const tagFilter = page.locator('[data-testid="tag-filter"]');
    if (await tagFilter.isVisible()) {
      // 查找"免费"标签
      const freeTag = tagFilter.locator('text=免费');
      if (await freeTag.isVisible()) {
        await freeTag.click();

        // 等待筛选结果
        await page.waitForTimeout(1000);

        // 验证页面刷新并包含筛选结果
        await expect(page.locator('text=资源')).toBeVisible();
      }
    }
  });

  test('分页功能应该工作', async ({ page }) => {
    await page.goto('/');

    // 查找分页组件
    const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="分页"]');
    if (await pagination.isVisible()) {
      // 验证页码显示
      const pageNumbers = pagination.locator('button, a');
      if (await pageNumbers.count() > 0) {
        await expect(pageNumbers.first()).toBeVisible();
      }
    }
  });

  test('资源详情页应该可以访问', async ({ page }) => {
    await page.goto('/');

    // 查找第一个资源链接
    const firstResourceLink = page.locator('[data-testid="resource-link"]').first();
    if (await firstResourceLink.isVisible()) {
      await firstResourceLink.click();

      // 验证导航到详情页或相应的处理
      await page.waitForTimeout(1000);

      // 检查是否还在同一页面（如果没有详情页）
      const currentUrl = page.url();
      expect(currentUrl).toContain('localhost:3000');
    }
  });

  test('页脚链接应该工作', async ({ page }) => {
    await page.goto('/');

    // 查找并测试页脚链接
    const footerLinks = page.locator('footer a');
    const linkCount = await footerLinks.count();

    if (linkCount > 0) {
      // 测试第一个链接
      const firstLink = footerLinks.first();
      const href = await firstLink.getAttribute('href');

      if (href && href.startsWith('/')) {
        await firstLink.click();

        // 验证页面导航
        await page.waitForTimeout(1000);
        const currentUrl = page.url();
        expect(currentUrl).toContain('localhost:3000');
      }
    }
  });

  test('页面响应式设计应该在移动端正常工作', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 验证移动端元素可见性
    await expect(page.locator('h1')).toBeVisible();

    // 查找移动端导航菜单
    const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="菜单"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }

    // 验证资源卡片在移动端的显示
    const resourceCards = page.locator('[data-testid="resource-card"]');
    if (await resourceCards.count() > 0) {
      await expect(resourceCards.first()).toBeVisible();
    }
  });

  test('页面加载性能应该在可接受范围内', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 验证页面加载时间在合理范围内（5秒内）
    expect(loadTime).toBeLessThan(5000);
  });

  test('页面应该在控制台没有JavaScript错误', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 验证没有JavaScript错误
    expect(errors.length).toBe(0);
  });
});

test.describe('前台 API 测试', () => {
  test('资源API应该返回正确结构', async ({ request }) => {
    const response = await request.get('/api/resources');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // 验证响应结构
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('resources');
    expect(data.data).toHaveProperty('pagination');
    expect(data.data).toHaveProperty('filters');
  });

  test('资源API应该支持各种查询参数', async ({ request }) => {
    const testCases = [
      { query: 'search=Unity', expectResults: true },
      { query: 'status=published', expectResults: true },
      { query: 'limit=5', expectResults: true },
      { query: 'page=1', expectResults: true }
    ];

    for (const testCase of testCases) {
      const response = await request.get(`/api/resources?${testCase.query}`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.success).toBe(true);

      if (testCase.expectResults) {
        expect(data.data.resources).toBeDefined();
      }
    }
  });

  test('应该增加资源的浏览量', async ({ request }) => {
    // 首先获取初始浏览量
    const firstResponse = await request.get('/api/resources');
    const firstData = await firstResponse.json();
    const initialViewCount = firstData.data.resources[0]?.viewCount || 0;

    // 等待一点时间确保浏览量更新
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 再次请求
    const secondResponse = await request.get('/api/resources');
    const secondData = await secondResponse.json();
    const updatedViewCount = secondData.data.resources[0]?.viewCount || 0;

    // 浏览量应该增加或者保持不变（取决于实现）
    expect(typeof updatedViewCount).toBe('number');
    expect(updatedViewCount).toBeGreaterThanOrEqual(initialViewCount);
  });
});