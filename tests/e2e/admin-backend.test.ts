import { test, expect } from '@playwright/test';

test.describe('后台管理功能完整测试', () => {
  let authToken: string;
  let resourceId: string;

  test.beforeAll(async ({ request }) => {
    // 获取管理员认证令牌
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'admin123456'
      }
    });

    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    authToken = loginData.data.token;

    // 获取第一个资源ID用于测试
    const resourcesResponse = await request.get('/api/admin/resources?limit=1', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const resourcesData = await resourcesResponse.json();
    if (resourcesData.data.resources.length > 0) {
      resourceId = resourcesData.data.resources[0].id;
    }
  });

  test.describe('认证功能', () => {
    test('管理员登录成功', async ({ request }) => {
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

    test('无效登录失败', async ({ request }) => {
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
  });

  test.describe('资源管理功能', () => {
    test('获取资源列表', async ({ request }) => {
      const response = await request.get('/api/admin/resources', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.resources).toBeDefined();
      expect(data.data.resources.length).toBeGreaterThan(0);
      expect(data.data.pagination).toBeDefined();
    });

    test('获取单个资源详情', async ({ request }) => {
      if (!resourceId) {
        test.skip();
        return;
      }

      const response = await request.get(`/api/admin/resources/${resourceId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.resource.id).toBe(resourceId);
      expect(data.data.resource.title).toBeDefined();
      expect(data.data.resource.type).toBeDefined();
      expect(data.data.resource.category).toBeDefined();
      expect(data.data.resource.tags).toBeDefined();
    });

    test('创建新资源', async ({ request }) => {
      const newResource = {
        title: 'E2E测试资源',
        slug: `e2e-test-resource-${Date.now()}`,
        description: '这是一个E2E测试创建的资源',
        typeId: 'cmikl19zx0002sprabs0p1xp3', // Unity Assets 类型
        categoryId: 'cmikl1a120009spra8yfnkb1v', // 游戏开发分类
        status: 'draft' as const,
        tagIds: ['cmikl1a3y000dsprah945gcxy'], // 免费标签
        downloadLinks: [
          {
            provider: '测试提供商',
            url: 'https://example.com/test-e2e',
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

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.resource.title).toBe(newResource.title);
      expect(data.data.resource.slug).toBe(newResource.slug);
      expect(data.data.resource.status).toBe('draft');
    });

    test('创建资源验证失败', async ({ request }) => {
      const invalidResource = {
        title: '', // 空标题应该失败
        slug: 'invalid-test',
        description: '测试资源',
        typeId: 'invalid-type-id',
        categoryId: 'invalid-category-id'
      };

      const response = await request.post('/api/admin/resources', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: invalidResource
      });

      expect(response.status()).toBe(400);
    });

    test('更新现有资源', async ({ request }) => {
      if (!resourceId) {
        test.skip();
        return;
      }

      const updateData = {
        title: '已更新的资源标题',
        description: '这是更新后的描述',
        status: 'published' as const
      };

      const response = await request.put(`/api/admin/resources/${resourceId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: updateData
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.resource.title).toBe(updateData.title);
      expect(data.data.resource.status).toBe('published');
    });

    test('删除资源', async ({ request }) => {
      // 先创建一个临时资源用于删除测试
      const tempResource = {
        title: '临时删除测试资源',
        slug: `temp-delete-test-${Date.now()}`,
        description: '这个资源将被删除',
        typeId: 'cmikl19zx0002sprabs0p1xp3',
        categoryId: 'cmikl1a120009spra8yfnkb1v',
        status: 'draft' as const
      };

      const createResponse = await request.post('/api/admin/resources', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: tempResource
      });

      const createData = await createResponse.json();
      const tempResourceId = createData.data.resource.id;

      // 删除创建的资源
      const deleteResponse = await request.delete(`/api/admin/resources/${tempResourceId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const deleteData = await deleteResponse.json();
      expect(deleteResponse.ok()).toBeTruthy();
      expect(deleteData.success).toBe(true);
      expect(deleteData.message).toBe('资源删除成功');

      // 验证资源确实被删除
      const verifyResponse = await request.get(`/api/admin/resources/${tempResourceId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(verifyResponse.status()).toBe(404);
    });

    test('删除不存在的资源', async ({ request }) => {
      const response = await request.delete('/api/admin/resources/non-existent-id', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(response.status()).toBe(404);
      expect(data.error).toBe('资源不存在');
    });
  });

  test.describe('分类管理功能', () => {
    test('获取分类列表', async ({ request }) => {
      const response = await request.get('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.categories).toBeDefined();
      expect(data.data.categories.length).toBeGreaterThan(0);
    });

    test('分类数据结构正确', async ({ request }) => {
      const response = await request.get('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      const category = data.data.categories[0];

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('icon');
      expect(category).toHaveProperty('supportedTypes');
      expect(category).toHaveProperty('_count');
    });
  });

  test.describe('数据筛选和搜索功能', () => {
    test('按状态筛选资源', async ({ request }) => {
      const response = await request.get('/api/admin/resources?status=published', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);

      // 验证所有返回的资源都是已发布状态
      data.data.resources.forEach((resource: any) => {
        expect(resource.status).toBe('published');
      });
    });

    test('按类型筛选资源', async ({ request }) => {
      const response = await request.get('/api/admin/resources?typeId=cmikl19zx0002sprabs0p1xp3', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);

      // 验证所有返回的资源都是指定类型
      data.data.resources.forEach((resource: any) => {
        expect(resource.typeId).toBe('cmikl19zx0002sprabs0p1xp3');
      });
    });

    test('搜索资源', async ({ request }) => {
      const response = await request.get('/api/admin/resources?search=Unity', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);

      // 验证搜索结果包含Unity相关内容
      const hasUnityResource = data.data.resources.some((resource: any) =>
        resource.title.toLowerCase().includes('unity') ||
        resource.description.toLowerCase().includes('unity')
      );
      expect(hasUnityResource).toBe(true);
    });

    test('分页功能', async ({ request }) => {
      const response = await request.get('/api/admin/resources?page=1&limit=2', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.resources).toHaveLength(2);
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.limit).toBe(2);
    });
  });

  test.describe('权限验证', () => {
    test('未认证访问被拒绝', async ({ request }) => {
      const response = await request.get('/api/admin/resources');
      expect(response.status()).toBe(401);
    });

    test('无效令牌被拒绝', async ({ request }) => {
      const response = await request.get('/api/admin/resources', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      expect(response.status()).toBe(401);
    });

    test('所有管理员API都需要认证', async ({ request }) => {
      const endpoints = [
        '/api/admin/resources',
        '/api/admin/categories',
        '/api/admin/resources/test-id'
      ];

      for (const endpoint of endpoints) {
        const response = await request.get(endpoint);
        expect(response.status()).toBe(401);
      }
    });
  });

  test.describe('数据完整性', () => {
    test('资源数据完整性', async ({ request }) => {
      const response = await request.get('/api/admin/resources', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(data.success).toBe(true);

      // 验证每个资源都有必要的字段
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
        expect(resource).toHaveProperty('createdAt');
        expect(resource).toHaveProperty('updatedAt');
      });
    });

    test('标签关系数据正确', async ({ request }) => {
      const response = await request.get('/api/admin/resources', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(data.success).toBe(true);

      // 验证标签关系数据结构
      data.data.resources.forEach((resource: any) => {
        expect(Array.isArray(resource.tags)).toBe(true);
        if (resource.tags.length > 0) {
          const tagRelation = resource.tags[0];
          expect(tagRelation).toHaveProperty('tag');
          expect(tagRelation.tag).toHaveProperty('id');
          expect(tagRelation.tag).toHaveProperty('name');
          expect(tagRelation.tag).toHaveProperty('color');
        }
      });
    });

    test('下载链接数据正确', async ({ request }) => {
      const response = await request.get('/api/admin/resources', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      expect(data.success).toBe(true);

      // 验证下载链接数据结构
      data.data.resources.forEach((resource: any) => {
        expect(Array.isArray(resource.downloadLinks)).toBe(true);
        if (resource.downloadLinks.length > 0) {
          const downloadLink = resource.downloadLinks[0];
          expect(downloadLink).toHaveProperty('id');
          expect(downloadLink).toHaveProperty('provider');
          expect(downloadLink).toHaveProperty('url');
          expect(downloadLink).toHaveProperty('price');
          expect(downloadLink).toHaveProperty('platform');
          expect(downloadLink).toHaveProperty('quality');
          expect(downloadLink).toHaveProperty('isActive');
        }
      });
    });
  });
});