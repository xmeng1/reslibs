import { test, expect } from '@playwright/test'

test.describe('ResLibs 管理后台', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })

  test('应该显示登录页面', async ({ page }) => {
    // 检查登录页面标题
    await expect(page.getByRole('heading', { name: '管理员登录' })).toBeVisible()
    await expect(page.getByText('ResLibs 管理后台')).toBeVisible()

    // 检查登录表单
    await expect(page.getByLabel('用户名')).toBeVisible()
    await expect(page.getByLabel('密码')).toBeVisible()
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
  })

  test('应该正确处理登录功能', async ({ page }) => {
    // 输入正确的凭据
    await page.getByLabel('用户名').fill('admin')
    await page.getByLabel('密码').fill('admin123456')

    // 点击登录按钮
    await page.getByRole('button', { name: '登录' }).click()

    // 等待跳转到管理后台主页
    await expect(page).toHaveURL('/admin/dashboard')

    // 检查管理后台主页元素
    await expect(page.getByRole('heading', { name: '管理后台' })).toBeVisible()
    await expect(page.getByText('欢迎回来，管理员')).toBeVisible()
  })

  test('应该正确处理错误的登录凭据', async ({ page }) => {
    // 输入错误的凭据
    await page.getByLabel('用户名').fill('wrong')
    await page.getByLabel('密码').fill('wrongpassword')

    // 点击登录按钮
    await page.getByRole('button', { name: '登录' }).click()

    // 检查错误消息
    await expect(page.getByText('用户名或密码错误')).toBeVisible()

    // 应该仍然在登录页面
    await expect(page).toHaveURL('/admin')
  })

  test('应该正确处理空的用户名和密码', async ({ page }) => {
    // 点击登录按钮而不输入任何凭据
    await page.getByRole('button', { name: '登录' }).click()

    // 检查验证错误
    await expect(page.getByText('请输入用户名')).toBeVisible()
    await expect(page.getByText('请输入密码')).toBeVisible()
  })

  test.describe('已登录状态的管理功能', () => {
    test.beforeEach(async ({ page }) => {
      // 先登录
      await page.goto('/admin')
      await page.getByLabel('用户名').fill('admin')
      await page.getByLabel('密码').fill('admin123456')
      await page.getByRole('button', { name: '登录' }).click()
      await expect(page).toHaveURL('/admin/dashboard')
    })

    test('应该显示管理仪表板', async ({ page }) => {
      // 检查统计卡片
      await expect(page.getByText('总资源数')).toBeVisible()
      await expect(page.getByText('总下载量')).toBeVisible()
      await expect(page.getByText('总用户数')).toBeVisible()
      await expect(page.getByText('今日新增')).toBeVisible()

      // 检查快速操作按钮
      await expect(page.getByRole('button', { name: '添加资源' })).toBeVisible()
      await expect(page.getByRole('button', { name: '管理分类' })).toBeVisible()
      await expect(page.getByRole('button', { name: '查看用户' })).toBeVisible()
    })

    test('应该显示侧边栏导航', async ({ page }) => {
      // 检查导航菜单
      await expect(page.getByRole('link', { name: '仪表板' })).toBeVisible()
      await expect(page.getByRole('link', { name: '资源管理' })).toBeVisible()
      await expect(page.getByRole('link', { name: '分类管理' })).toBeVisible()
      await expect(page.getByRole('link', { name: '用户管理' })).toBeVisible()
      await expect(page.getByRole('link', { name: '系统设置' })).toBeVisible()
    })

    test('应该正确导航到资源管理页面', async ({ page }) => {
      // 点击资源管理链接
      await page.getByRole('link', { name: '资源管理' }).click()
      await expect(page).toHaveURL('/admin/resources')

      // 检查资源管理页面
      await expect(page.getByRole('heading', { name: '资源管理' })).toBeVisible()
      await expect(page.getByPlaceholder('搜索资源...')).toBeVisible()
    })

    test('应该正确导航到分类管理页面', async ({ page }) => {
      // 点击分类管理链接
      await page.getByRole('link', { name: '分类管理' }).click()
      await expect(page).toHaveURL('/admin/categories')

      // 检查分类管理页面
      await expect(page.getByRole('heading', { name: '分类管理' })).toBeVisible()
      await expect(page.getByRole('button', { name: '添加分类' })).toBeVisible()
    })

    test('应该正确导航到用户管理页面', async ({ page }) => {
      // 点击用户管理链接
      await page.getByRole('link', { name: '用户管理' }).click()
      await expect(page).toHaveURL('/admin/users')

      // 检查用户管理页面
      await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible()
      await expect(page.getByPlaceholder('搜索用户...')).toBeVisible()
    })

    test('应该正确处理登出功能', async ({ page }) => {
      // 点击登出按钮
      await page.getByRole('button', { name: '登出' }).click()

      // 应该返回到登录页面
      await expect(page).toHaveURL('/admin')
      await expect(page.getByRole('heading', { name: '管理员登录' })).toBeVisible()
    })
  })

  test.describe('资源管理功能', () => {
    test.beforeEach(async ({ page }) => {
      // 登录并导航到资源管理页面
      await page.goto('/admin')
      await page.getByLabel('用户名').fill('admin')
      await page.getByLabel('密码').fill('admin123456')
      await page.getByRole('button', { name: '登录' }).click()
      await page.getByRole('link', { name: '资源管理' }).click()
    })

    test('应该显示资源列表', async ({ page }) => {
      // 检查资源表格
      await expect(page.locator('table')).toBeVisible()

      // 检查表头
      await expect(page.getByText('资源名称')).toBeVisible()
      await expect(page.getByText('类型')).toBeVisible()
      await expect(page.getByText('大小')).toBeVisible()
      await expect(page.getByText('下载量')).toBeVisible()
      await expect(page.getByText('状态')).toBeVisible()
      await expect(page.getByText('操作')).toBeVisible()

      // 检查资源数据
      await expect(page.getByText('Low Poly Shooter Pack')).toBeVisible()
      await expect(page.getByText('Blender 3D 建模工具')).toBeVisible()
    })

    test('应该正确处理搜索功能', async ({ page }) => {
      // 输入搜索关键词
      await page.getByPlaceholder('搜索资源...').fill('Unity')

      // 点击搜索按钮
      await page.getByRole('button', { name: '搜索' }).click()

      // 验证搜索结果
      await expect(page.getByText('Low Poly Shooter Pack')).toBeVisible()
    })

    test('应该正确处理资源编辑功能', async ({ page }) => {
      // 点击编辑按钮
      await page.getByRole('button', { name: '编辑' }).first().click()

      // 检查编辑表单
      await expect(page.getByRole('heading', { name: '编辑资源' })).toBeVisible()
      await expect(page.getByLabel('资源名称')).toBeVisible()
      await expect(page.getByLabel('资源描述')).toBeVisible()
      await expect(page.getByLabel('资源类型')).toBeVisible()

      // 修改资源信息
      await page.getByLabel('资源名称').fill('Updated Resource Name')

      // 点击保存按钮
      await page.getByRole('button', { name: '保存' }).click()

      // 验证保存成功消息
      await expect(page.getByText('资源更新成功')).toBeVisible()
    })

    test('应该正确处理资源删除功能', async ({ page }) => {
      // 点击删除按钮
      await page.getByRole('button', { name: '删除' }).first().click()

      // 检查确认对话框
      await expect(page.getByText('确认删除')).toBeVisible()
      await expect(page.getByText('确定要删除这个资源吗？')).toBeVisible()

      // 点击确认删除
      await page.getByRole('button', { name: '确认删除' }).click()

      // 验证删除成功消息
      await expect(page.getByText('资源删除成功')).toBeVisible()
    })

    test('应该正确处理添加新资源功能', async ({ page }) => {
      // 点击添加资源按钮
      await page.getByRole('button', { name: '添加资源' }).click()

      // 检查添加资源表单
      await expect(page.getByRole('heading', { name: '添加新资源' })).toBeVisible()
      await expect(page.getByLabel('资源名称')).toBeVisible()
      await expect(page.getByLabel('资源描述')).toBeVisible()
      await expect(page.getByLabel('资源类型')).toBeVisible()
      await expect(page.getByLabel('文件上传')).toBeVisible()

      // 填写资源信息
      await page.getByLabel('资源名称').fill('Test Resource')
      await page.getByLabel('资源描述').fill('Test resource description')
      await page.selectOption('select[name="type"]', 'unity-assets')

      // 点击保存按钮
      await page.getByRole('button', { name: '保存' }).click()

      // 验证添加成功消息
      await expect(page.getByText('资源添加成功')).toBeVisible()
    })
  })

  test.describe('分类管理功能', () => {
    test.beforeEach(async ({ page }) => {
      // 登录并导航到分类管理页面
      await page.goto('/admin')
      await page.getByLabel('用户名').fill('admin')
      await page.getByLabel('密码').fill('admin123456')
      await page.getByRole('button', { name: '登录' }).click()
      await page.getByRole('link', { name: '分类管理' }).click()
    })

    test('应该显示分类列表', async ({ page }) => {
      // 检查分类卡片
      await expect(page.getByText('Unity Assets')).toBeVisible()
      await expect(page.getByText('软件工具')).toBeVisible()
      await expect(page.getByText('设计素材')).toBeVisible()
      await expect(page.getByText('视频课程')).toBeVisible()

      // 检查分类描述
      await expect(page.getByText('Unity 游戏引擎资源和工具')).toBeVisible()
      await expect(page.getByText('各种实用软件和开发工具')).toBeVisible()
    })

    test('应该正确处理添加新分类功能', async ({ page }) => {
      // 点击添加分类按钮
      await page.getByRole('button', { name: '添加分类' }).click()

      // 检查添加分类表单
      await expect(page.getByRole('heading', { name: '添加新分类' })).toBeVisible()
      await expect(page.getByLabel('分类名称')).toBeVisible()
      await expect(page.getByLabel('分类描述')).toBeVisible()
      await expect(page.getByLabel('分类图标')).toBeVisible()

      // 填写分类信息
      await page.getByLabel('分类名称').fill('Test Category')
      await page.getByLabel('分类描述').fill('Test category description')
      await page.getByLabel('分类图标').fill('🧪')

      // 点击保存按钮
      await page.getByRole('button', { name: '保存' }).click()

      // 验证添加成功消息
      await expect(page.getByText('分类添加成功')).toBeVisible()
    })

    test('应该正确处理分类编辑功能', async ({ page }) => {
      // 点击编辑按钮
      await page.getByRole('button', { name: '编辑' }).first().click()

      // 检查编辑表单
      await expect(page.getByRole('heading', { name: '编辑分类' })).toBeVisible()

      // 修改分类信息
      await page.getByLabel('分类名称').fill('Updated Category')

      // 点击保存按钮
      await page.getByRole('button', { name: '保存' }).click()

      // 验证更新成功消息
      await expect(page.getByText('分类更新成功')).toBeVisible()
    })

    test('应该正确处理分类删除功能', async ({ page }) => {
      // 点击删除按钮
      await page.getByRole('button', { name: '删除' }).first().click()

      // 检查确认对话框
      await expect(page.getByText('确认删除分类')).toBeVisible()
      await expect(page.getByText('删除分类后，相关资源将不会被删除，但会失去分类关联。')).toBeVisible()

      // 点击确认删除
      await page.getByRole('button', { name: '确认删除' }).click()

      // 验证删除成功消息
      await expect(page.getByText('分类删除成功')).toBeVisible()
    })
  })
})