import { test, expect } from '@playwright/test';

test.describe('后台管理核心功能测试', () => {
  test('管理员登录应该成功', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });

    const data = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe('admin');
    expect(data.data.token).toBeDefined();
  });

  test('错误密码应该失败', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'wrongpassword'
      }
    });

    const data = await response.json();
    expect(response.status()).toBe(401);
    expect(data.error).toBe('密码错误');
  });

  test('获取资源列表需要认证', async ({ request }) => {
    const response = await request.get('/api/admin/resources');
    expect(response.status()).toBe(401);
  });

  test('认证后可以获取资源列表', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.data.token).toBeDefined();
    const token = loginData.data.token;

    // 使用token获取资源列表
    const response = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(data.success).toBe(true);
    expect(data.data.resources).toBeDefined();
    expect(data.data.resources.length).toBeGreaterThan(0);
  });

  test('认证后可以获取分类列表', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.data.token).toBeDefined();
    const token = loginData.data.token;

    // 使用token获取分类列表
    const response = await request.get('/api/admin/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(data.success).toBe(true);
    expect(data.data.categories).toBeDefined();
    expect(data.data.categories.length).toBeGreaterThan(0);
  });

  test('前台API不需要认证', async ({ request }) => {
    const response = await request.get('/api/resources');
    expect(response.ok()).toBeTruthy();
  });

  test('前台API返回正确的数据结构', async ({ request }) => {
    const response = await request.get('/api/resources');

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources).toBeDefined();
    expect(data.data.pagination).toBeDefined();

    if (data.data.resources.length > 0) {
      const resource = data.data.resources[0];
      expect(resource).toHaveProperty('title');
      expect(resource).toHaveProperty('type');
      expect(resource).toHaveProperty('category');
      expect(resource).toHaveProperty('tags');
    }
  });

  test('资源数据完整性验证', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    // 获取管理员资源数据
    const response = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    expect(data.success).toBe(true);

    // 验证每个资源的完整性
    data.data.resources.forEach((resource: any) => {
      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('title');
      expect(resource).toHaveProperty('slug');
      expect(resource).toHaveProperty('description');
      expect(resource).toHaveProperty('status');
      expect(resource).toHaveProperty('type');
      expect(resource).toHaveProperty('category');
      expect(resource).toHaveProperty('tags');
      expect(resource).toHaveProperty('downloadLinks');
    });
  });

  test('搜索功能应该工作', async ({ request }) => {
    const response = await request.get('/api/resources?search=Unity');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);

    // 应该有搜索结果
    expect(data.data.resources.length).toBeGreaterThan(0);
  });

  test('分类筛选应该工作', async ({ request }) => {
    const response = await request.get('/api/resources?type=unity-assets');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);

    // 所有结果都应该是unity-assets类型
    if (data.data.resources.length > 0) {
      data.data.resources.forEach((resource: any) => {
        expect(resource.type.name).toBe('unity-assets');
      });
    }
  });

  test('分页功能应该工作', async ({ request }) => {
    const response = await request.get('/api/resources?page=1&limit=3');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources).toHaveLength(3);
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(3);
  });
});