import { test, expect } from '@playwright/test';

test.describe('资源管理测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/admin/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('应该显示资源列表', async ({ page }) => {
    await page.goto('/admin/resources');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('资源管理');

    // 验证资源数据存在（使用API测试中确认的数据）
    await expect(page.locator('text=Low Poly Shooter Pack')).toBeVisible();
    await expect(page.locator('text=Blender 3D 建模软件')).toBeVisible();
    await expect(page.locator('text=Modern UI Design System')).toBeVisible();
  });

  test('应该显示资源的详细信息', async ({ page }) => {
    await page.goto('/admin/resources');

    // 验证第一个资源的详细信息
    const firstResource = page.locator('[data-testid="resource-card"]').first();
    await expect(firstResource.locator('[data-testid="resource-title"]')).toContainText('Low Poly Shooter Pack');
    await expect(firstResource.locator('[data-testid="resource-status"]')).toContainText('已发布');

    // 验证标签显示
    await expect(firstResource.locator('text=优质')).toBeVisible();
    await expect(firstResource.locator('text=免费')).toBeVisible();
  });

  test('应该能够搜索资源', async ({ page }) => {
    await page.goto('/admin/resources');

    // 使用搜索功能
    const searchInput = page.locator('input[placeholder*="搜索"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Unity');
      await page.keyboard.press('Enter');

      // 验证搜索结果
      await expect(page.locator('text=Low Poly Shooter Pack')).toBeVisible();
    }
  });

  test('应该能够按状态筛选资源', async ({ page }) => {
    await page.goto('/admin/resources');

    // 查找状态筛选器
    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('published');
      await page.keyboard.press('Enter');

      // 验证只显示已发布的资源
      await expect(page.locator('[data-testid="resource-card"]')).toHaveCount(6);
    }
  });
});

test.describe('API 资源测试', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // 获取认证令牌
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });

    const loginData = await loginResponse.json();
    expect(loginResponse.ok()).toBeTruthy();
    authToken = loginData.data.token;
  });

  test('GET /api/admin/resources 应该返回资源列表', async ({ request }) => {
    const response = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources).toHaveLength(6);
    expect(data.data.pagination.total).toBe(6);
  });

  test('GET /api/admin/resources 应该包含完整的资源信息', async ({ request }) => {
    const response = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    const resource = data.data.resources[0];

    // 验证资源字段
    expect(resource).toHaveProperty('id');
    expect(resource).toHaveProperty('title');
    expect(resource).toHaveProperty('slug');
    expect(resource).toHaveProperty('description');
    expect(resource).toHaveProperty('status');
    expect(resource).toHaveProperty('type');
    expect(resource).toHaveProperty('category');
    expect(resource).toHaveProperty('tags');
    expect(resource).toHaveProperty('downloadLinks');

    // 验证类型信息
    expect(resource.type).toHaveProperty('displayName');
    expect(resource.type).toHaveProperty('icon');

    // 验证分类信息
    expect(resource.category).toHaveProperty('name');
    expect(resource.category).toHaveProperty('icon');

    // 验证标签信息
    expect(Array.isArray(resource.tags)).toBe(true);
    if (resource.tags.length > 0) {
      expect(resource.tags[0]).toHaveProperty('tag');
      expect(resource.tags[0].tag).toHaveProperty('name');
      expect(resource.tags[0].tag).toHaveProperty('color');
    }

    // 验证下载链接
    expect(Array.isArray(resource.downloadLinks)).toBe(true);
  });

  test('GET /api/admin/resources 支持分页', async ({ request }) => {
    const response = await request.get('/api/admin/resources?page=1&limit=3', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    expect(data.data.resources).toHaveLength(3);
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(3);
  });

  test('GET /api/admin/resources 支持搜索', async ({ request }) => {
    const response = await request.get('/api/admin/resources?search=Unity', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    expect(data.data.resources.length).toBeGreaterThan(0);
    data.data.resources.forEach((resource: any) => {
      expect(
        resource.title.toLowerCase().includes('unity') ||
        resource.description.toLowerCase().includes('unity')
      ).toBe(true);
    });
  });

  test('GET /api/admin/resources 支持状态筛选', async ({ request }) => {
    const response = await request.get('/api/admin/resources?status=published', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    data.data.resources.forEach((resource: any) => {
      expect(resource.status).toBe('published');
    });
  });

  test('POST /api/admin/resources 应该创建新资源', async ({ request }) => {
    const newResource = {
      title: '测试资源',
      slug: 'test-resource-' + Date.now(),
      description: '这是一个测试资源',
      typeId: 'cmikl19zx0002sprabs0p1xp3', // Unity Assets 类型
      categoryId: 'cmikl1a120009spra8yfnkb1v', // 游戏开发分类
      status: 'draft',
      tagIds: ['cmikl1a3y000dsprah945gcxy'], // 免费标签
      downloadLinks: [
        {
          provider: '测试提供商',
          url: 'https://example.com/test',
          price: '免费',
          platform: 'All',
          quality: 'Original',
          isActive: true
        }
      ]
    };

    const response = await request.post('/api/admin/resources', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: newResource
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resource.title).toBe(newResource.title);
    expect(data.data.resource.slug).toBe(newResource.slug);
  });

  test('未认证访问应该被拒绝', async ({ request }) => {
    const response = await request.get('/api/admin/resources');
    expect(response.status()).toBe(401);
  });

  test('无效令牌应该被拒绝', async ({ request }) => {
    const response = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    expect(response.status()).toBe(401);
  });
});

test.describe('前台资源 API 测试', () => {
  test('GET /api/resources 应该返回已发布的资源', async ({ request }) => {
    const response = await request.get('/api/resources');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources).toHaveLength(6);

    // 验证所有资源都是已发布状态
    data.data.resources.forEach((resource: any) => {
      expect(resource.status).toBe('published');
    });
  });

  test('GET /api/resources 应该包含基本信息', async ({ request }) => {
    const response = await request.get('/api/resources');

    const data = await response.json();
    const resource = data.data.resources[0];

    // 验证前台API返回的字段
    expect(resource).toHaveProperty('id');
    expect(resource).toHaveProperty('title');
    expect(resource).toHaveProperty('slug');
    expect(resource).toHaveProperty('description');
    expect(resource).toHaveProperty('type');
    expect(resource).toHaveProperty('category');
    expect(resource).toHaveProperty('tags');
    expect(resource).toHaveProperty('downloadLinks');
    expect(resource).toHaveProperty('downloadCount');
    expect(resource).toHaveProperty('viewCount');
  });

  test('GET /api/resources 支持分页和筛选', async ({ request }) => {
    const response = await request.get('/api/resources?page=1&limit=3&sort=popular');

    const data = await response.json();
    expect(data.data.resources).toHaveLength(3);
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(3);
  });

  test('GET /api/resources 支持按类型筛选', async ({ request }) => {
    const response = await request.get('/api/resources?type=unity-assets');

    const data = await response.json();
    data.data.resources.forEach((resource: any) => {
      expect(resource.type.name).toBe('unity-assets');
    });
  });
});