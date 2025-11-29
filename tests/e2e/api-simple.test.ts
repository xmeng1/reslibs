import { test, expect } from '@playwright/test';

test.describe('API 基础功能测试', () => {
  let authToken: string;

  test('登录 API 应该工作', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe('admin');
    expect(data.data.token).toBeDefined();

    authToken = data.data.token;
  });

  test('管理员资源 API 应该受保护', async ({ request }) => {
    const response = await request.get('/api/admin/resources');
    expect(response.status()).toBe(401);
  });

  test('管理员资源 API 应该在认证后工作', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    // 使用token访问管理员API
    const response = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources).toBeDefined();
    expect(data.data.resources.length).toBeGreaterThan(0);
  });

  test('前台资源 API 应该公开访问', async ({ request }) => {
    const response = await request.get('/api/resources');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources).toBeDefined();
    expect(data.data.resources.length).toBe(6);
  });

  test('前台资源 API 应该返回正确的数据结构', async ({ request }) => {
    const response = await request.get('/api/resources');

    const data = await response.json();
    expect(data.data.resources[0]).toHaveProperty('title');
    expect(data.data.resources[0]).toHaveProperty('description');
    expect(data.data.resources[0]).toHaveProperty('type');
    expect(data.data.resources[0]).toHaveProperty('category');
    expect(data.data.resources[0]).toHaveProperty('tags');
  });

  test('应该能够搜索资源', async ({ request }) => {
    const response = await request.get('/api/resources?search=Unity');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources.length).toBeGreaterThan(0);

    // 验证搜索结果包含Unity相关内容
    const hasUnityResource = data.data.resources.some((resource: any) =>
      resource.title.toLowerCase().includes('unity') ||
      resource.description.toLowerCase().includes('unity')
    );
    expect(hasUnityResource).toBe(true);
  });

  test('应该支持分页', async ({ request }) => {
    const response = await request.get('/api/resources?page=1&limit=3');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.resources).toHaveLength(3);
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(3);
  });

  test('应该支持按类型筛选', async ({ request }) => {
    const response = await request.get('/api/resources?type=unity-assets');

    const data = await response.json();
    expect(data.success).toBe(true);

    // 查找Unity资源
    const unityResource = data.data.resources.find((resource: any) =>
      resource.type.name === 'unity-assets'
    );
    expect(unityResource).toBeDefined();
    expect(unityResource.title).toContain('Unity') || expect(unityResource.title).toContain('Shooter');
  });

  test('应该支持按标签筛选', async ({ request }) => {
    const response = await request.get('/api/resources?tag=免费');

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources.length).toBeGreaterThan(0);

    // 验证筛选结果都包含"免费"标签
    data.data.resources.forEach((resource: any) => {
      const hasFreeTag = resource.tags.some((tag: any) =>
        tag.tag.name === '免费'
      );
      expect(hasFreeTag).toBe(true);
    });
  });
});

test.describe('数据完整性测试', () => {
  test('所有种子数据应该完整存在', async ({ request }) => {
    const response = await request.get('/api/resources');
    const data = await response.json();

    // 验证种子数据中的6个资源都存在
    const expectedResources = [
      'Low Poly Shooter Pack',
      'Blender 3D 建模软件',
      'Modern UI Design System',
      'Unity游戏开发完整教程',
      'RPG游戏背景音乐集',
      'React 开发完整指南'
    ];

    const actualResources = data.data.resources.map((r: any) => r.title);
    expectedResources.forEach(expectedTitle => {
      expect(actualResources).toContain(expectedTitle);
    });
  });

  test('资源应该有正确的元数据', async ({ request }) => {
    const response = await request.get('/api/resources');
    const data = await response.json();

    // 验证每个资源的必要字段
    data.data.resources.forEach((resource: any) => {
      expect(resource.id).toBeDefined();
      expect(resource.slug).toBeDefined();
      expect(resource.status).toBe('published');
      expect(resource.downloadCount).toBeGreaterThan(0);
      expect(resource.viewCount).toBeGreaterThan(0);
      expect(resource.type).toBeDefined();
      expect(resource.category).toBeDefined();
      expect(Array.isArray(resource.tags)).toBe(true);
      expect(Array.isArray(resource.downloadLinks)).toBe(true);
    });
  });
});