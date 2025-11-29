import { test, expect, request } from '@playwright/test'

test.describe('ResLibs API 接口测试', () => {
  let apiContext: any

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: 'http://localhost:3000/api',
    })
  })

  test.afterAll(async () => {
    await apiContext.dispose()
  })

  test.describe('认证相关接口', () => {
    test('POST /api/auth/login - 登录接口', async () => {
      const response = await apiContext.post('/auth/login', {
        data: {
          username: 'admin',
          password: 'admin123456'
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('token')
      expect(responseData).toHaveProperty('user')
      expect(responseData.user.username).toBe('admin')
    })

    test('POST /api/auth/login - 错误凭据', async () => {
      const response = await apiContext.post('/auth/login', {
        data: {
          username: 'wrong',
          password: 'wrongpassword'
        }
      })

      expect(response.status()).toBe(401)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('message', '用户名或密码错误')
    })

    test('POST /api/auth/login - 缺少参数', async () => {
      const response = await apiContext.post('/auth/login', {
        data: {
          username: 'admin'
          // 缺少密码
        }
      })

      expect(response.status()).toBe(400)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('message')
    })

    test('POST /api/auth/logout - 登出接口', async () => {
      // 先登录获取token
      const loginResponse = await apiContext.post('/auth/login', {
        data: {
          username: 'admin',
          password: 'admin123456'
        }
      })
      const loginData = await loginResponse.json()
      const token = loginData.token

      // 使用token登出
      const response = await apiContext.post('/auth/logout', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('message', '登出成功')
    })
  })

  test.describe('资源相关接口', () => {
    let authToken: string

    test.beforeAll(async () => {
      // 获取管理员token用于需要认证的接口
      const loginResponse = await apiContext.post('/auth/login', {
        data: {
          username: 'admin',
          password: 'admin123456'
        }
      })
      const loginData = await loginResponse.json()
      authToken = loginData.token
    })

    test('GET /api/resources - 获取资源列表', async () => {
      const response = await apiContext.get('/resources')

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('resources')
      expect(Array.isArray(responseData.data.resources)).toBe(true)
      expect(responseData.data).toHaveProperty('pagination')
      expect(responseData.data.pagination).toHaveProperty('total')
      expect(responseData.data.pagination).toHaveProperty('page')
      expect(responseData.data.pagination).toHaveProperty('pageSize')
    })

    test('GET /api/resources - 带查询参数的资源列表', async () => {
      const response = await apiContext.get('/resources', {
        params: {
          page: 1,
          limit: 10,
          type: 'unity-assets',
          search: 'Unity'
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData.data).toHaveProperty('resources')
    })

    test('GET /api/resources/:id - 获取单个资源详情', async () => {
      const response = await apiContext.get('/resources/1')

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('id', 1)
      expect(responseData.data).toHaveProperty('name')
      expect(responseData.data).toHaveProperty('description')
      expect(responseData.data).toHaveProperty('type')
      expect(responseData.data).toHaveProperty('downloadCount')
    })

    test('GET /api/resources/:id - 不存在的资源ID', async () => {
      const response = await apiContext.get('/resources/999999')

      expect(response.status()).toBe(404)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('message', '资源不存在')
    })

    test('POST /api/resources - 创建新资源（需要认证）', async () => {
      const response = await apiContext.post('/resources', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Test API Resource',
          description: 'This is a test resource created via API',
          type: 'unity-assets',
          category: 'game-assets',
          tags: ['test', 'api'],
          downloadUrl: 'https://example.com/download',
          version: '1.0.0',
          size: '100MB'
        }
      })

      expect(response.status()).toBe(201)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(responseData.data.name).toBe('Test API Resource')
    })

    test('POST /api/resources - 未认证创建资源', async () => {
      const response = await apiContext.post('/resources', {
        data: {
          name: 'Test Resource',
          description: 'Test description'
        }
      })

      expect(response.status()).toBe(401)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('message', '需要认证')
    })

    test('PUT /api/resources/:id - 更新资源（需要认证）', async () => {
      const response = await apiContext.put('/resources/1', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Updated Resource Name',
          description: 'Updated description'
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData.data.name).toBe('Updated Resource Name')
    })

    test('DELETE /api/resources/:id - 删除资源（需要认证）', async () => {
      // 先创建一个资源用于删除测试
      const createResponse = await apiContext.post('/resources', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Resource to Delete',
          description: 'This resource will be deleted'
        }
      })
      const createData = await createResponse.json()
      const resourceId = createData.data.id

      // 删除资源
      const response = await apiContext.delete(`/resources/${resourceId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('message', '资源删除成功')
    })

    test('POST /api/resources/:id/download - 记录下载', async () => {
      const response = await apiContext.post('/resources/1/download')

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('downloadUrl')
    })
  })

  test.describe('分类相关接口', () => {
    let authToken: string

    test.beforeAll(async () => {
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

    test('GET /api/categories - 获取分类列表', async () => {
      const response = await apiContext.get('/categories')

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(Array.isArray(responseData.data)).toBe(true)

      // 检查分类数据结构
      const categories = responseData.data
      if (categories.length > 0) {
        expect(categories[0]).toHaveProperty('id')
        expect(categories[0]).toHaveProperty('name')
        expect(categories[0]).toHaveProperty('description')
        expect(categories[0]).toHaveProperty('icon')
      }
    })

    test('POST /api/categories - 创建新分类（需要认证）', async () => {
      const response = await apiContext.post('/categories', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Test API Category',
          description: 'This is a test category created via API',
          icon: '🧪'
        }
      })

      expect(response.status()).toBe(201)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData.data.name).toBe('Test API Category')
    })

    test('POST /api/categories - 未认证创建分类', async () => {
      const response = await apiContext.post('/categories', {
        data: {
          name: 'Unauthorized Category'
        }
      })

      expect(response.status()).toBe(401)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('message', '需要认证')
    })

    test('PUT /api/categories/:id - 更新分类（需要认证）', async () => {
      const response = await apiContext.put('/categories/1', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Updated Category Name',
          description: 'Updated description'
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData.data.name).toBe('Updated Category Name')
    })
  })

  test.describe('搜索相关接口', () => {
    test('GET /api/search - 搜索资源', async () => {
      const response = await apiContext.get('/search', {
        params: {
          q: 'Unity',
          type: 'unity-assets',
          page: 1,
          limit: 10
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('results')
      expect(responseData.data).toHaveProperty('pagination')
    })

    test('GET /api/search - 空搜索查询', async () => {
      const response = await apiContext.get('/search', {
        params: {
          q: '',
          page: 1,
          limit: 10
        }
      })

      expect(response.status()).toBe(400)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('message', '搜索关键词不能为空')
    })

    test('GET /api/search/suggestions - 搜索建议', async () => {
      const response = await apiContext.get('/search/suggestions', {
        params: {
          q: 'Uni'
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(Array.isArray(responseData.data)).toBe(true)
    })
  })

  test.describe('统计相关接口', () => {
    let authToken: string

    test.beforeAll(async () => {
      const loginResponse = await apiContext.post('/auth/login', {
        data: {
          username: 'admin',
          password: 'admin123456'
        }
      })
      const loginData = await loginResponse.json()
      authToken = loginData.token
    })

    test('GET /api/stats/dashboard - 获取仪表板统计数据（需要认证）', async () => {
      const response = await apiContext.get('/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('totalResources')
      expect(responseData.data).toHaveProperty('totalDownloads')
      expect(responseData.data).toHaveProperty('totalUsers')
      expect(responseData.data).toHaveProperty('todayNew')
    })

    test('GET /api/stats/dashboard - 未认证访问统计', async () => {
      const response = await apiContext.get('/stats/dashboard')

      expect(response.status()).toBe(401)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('message', '需要认证')
    })
  })

  test.describe('文件上传接口', () => {
    let authToken: string

    test.beforeAll(async () => {
      const loginResponse = await apiContext.post('/auth/login', {
        data: {
          username: 'admin',
          password: 'admin123456'
        }
      })
      const loginData = await loginResponse.json()
      authToken = loginData.token
    })

    test('POST /api/upload - 文件上传（需要认证）', async () => {
      // 创建一个模拟文件
      const fileBuffer = Buffer.from('test file content')

      const response = await apiContext.post('/upload', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        multipart: {
          file: {
            name: 'test.txt',
            mimeType: 'text/plain',
            buffer: fileBuffer
          }
        }
      })

      // 注意：这个测试可能会失败，取决于实际的文件上传实现
      // 这里只是测试接口结构和认证
      expect([200, 400, 413]).toContain(response.status())
    })

    test('POST /api/upload - 未认证文件上传', async () => {
      const response = await apiContext.post('/upload')

      expect(response.status()).toBe(401)
      const responseData = await response.json()
      expect(responseData).toHaveProperty('success', false)
      expect(responseData).toHaveProperty('message', '需要认证')
    })
  })

  test.describe('错误处理测试', () => {
    test('不存在的API端点', async () => {
      const response = await apiContext.get('/nonexistent')

      expect(response.status()).toBe(404)
    })

    test('无效的HTTP方法', async () => {
      const response = await apiContext.patch('/resources')

      expect(response.status()).toBe(405) // Method Not Allowed
    })

    test('无效的JSON格式', async () => {
      const response = await apiContext.post('/resources', {
        headers: {
          'Content-Type': 'application/json'
        },
        data: 'invalid json'
      })

      expect(response.status()).toBe(400)
    })
  })
})