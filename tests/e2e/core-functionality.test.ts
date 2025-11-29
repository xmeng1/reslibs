import { test, expect } from '@playwright/test';

test.describe('系统核心功能验证', () => {
  test('管理员登录和API访问', async ({ request }) => {
    // 测试登录
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

    // 测试获取资源列表
    const resourcesResponse = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(resourcesResponse.ok()).toBeTruthy();
    const resourcesData = await resourcesResponse.json();
    expect(resourcesData.success).toBe(true);
    expect(resourcesData.data.resources.length).toBeGreaterThan(0);

    // 测试获取分类列表
    const categoriesResponse = await request.get('/api/admin/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(categoriesResponse.ok()).toBeTruthy();
    const categoriesData = await categoriesResponse.json();
    expect(categoriesData.success).toBe(true);
    expect(categoriesData.data.categories.length).toBeGreaterThan(0);
  });

  test('前台资源API正常工作', async ({ request }) => {
    const response = await request.get('/api/resources');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.resources).toBeDefined();
    expect(data.data.pagination).toBeDefined();

    // 验证数据结构
    if (data.data.resources.length > 0) {
      const resource = data.data.resources[0];
      expect(resource).toHaveProperty('title');
      expect(resource).toHaveProperty('type');
      expect(resource).toHaveProperty('category');
      expect(resource).toHaveProperty('tags');
    }
  });

  test('搜索和筛选功能', async ({ request }) => {
    // 测试搜索
    const searchResponse = await request.get('/api/resources?search=Unity');
    expect(searchResponse.ok()).toBeTruthy();

    const searchData = await searchResponse.json();
    expect(searchData.success).toBe(true);

    // 测试类型筛选
    const filterResponse = await request.get('/api/resources?type=unity-assets');
    expect(filterResponse.ok()).toBeTruthy();

    const filterData = await filterResponse.json();
    expect(filterData.success).toBe(true);

    // 测试分页
    const pageResponse = await request.get('/api/resources?page=1&limit=3');
    expect(pageResponse.ok()).toBeTruthy();

    const pageData = await pageResponse.json();
    expect(pageData.success).toBe(true);
    expect(pageData.data.resources).toHaveLength(3);
  });

  test('权限验证', async ({ request }) => {
    // 测试未认证访问
    const unauthorizedResponse = await request.get('/api/admin/resources');
    expect(unauthorizedResponse.status()).toBe(401);

    // 测试无效令牌
    const invalidTokenResponse = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    expect(invalidTokenResponse.status()).toBe(401);
  });

  test('数据完整性验证', async ({ request }) => {
    // 登录获取token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    // 获取资源数据
    const response = await request.get('/api/admin/resources', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    expect(data.success).toBe(true);

    // 验证每个资源的数据完整性
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

      // 验证类型数据
      expect(resource.type).toHaveProperty('name');
      expect(resource.type).toHaveProperty('displayName');
      expect(resource.type).toHaveProperty('icon');

      // 验证分类数据
      expect(resource.category).toHaveProperty('name');
      expect(resource.category).toHaveProperty('icon');

      // 验证标签数据
      expect(Array.isArray(resource.tags)).toBe(true);
      resource.tags.forEach((tag: any) => {
        expect(tag).toHaveProperty('tag');
        expect(tag.tag).toHaveProperty('name');
        expect(tag.tag).toHaveProperty('color');
      });

      // 验证下载链接数据
      expect(Array.isArray(resource.downloadLinks)).toBe(true);
      resource.downloadLinks.forEach((link: any) => {
        expect(link).toHaveProperty('provider');
        expect(link).toHaveProperty('url');
        expect(link).toHaveProperty('price');
        expect(link).toHaveProperty('platform');
      });
    });
  });
});