import { test, expect } from '@playwright/test'

test.describe('ResLibs 资源列表页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resources')
  })

  test('应该正确加载资源列表页', async ({ page }) => {
    // 检查标题
    await expect(page).toHaveTitle(/ResLibs/)

    // 检查页面标题
    await expect(page.getByRole('heading', { name: '资源库' })).toBeVisible()
    await expect(page.getByText('发现和下载优质的各类资源')).toBeVisible()
  })

  test('应该显示搜索和筛选功能', async ({ page }) => {
    // 检查搜索框
    await expect(page.getByPlaceholder('搜索资源...')).toBeVisible()
    await expect(page.getByRole('button', { name: '搜索' })).toBeVisible()

    // 检查资源类型筛选
    await expect(page.getByLabel('筛选器')).toBeVisible()
    await expect(page.getByRole('combobox', { name: '所有类型' })).toBeVisible()

    // 检查排序选项
    await expect(page.getByRole('combobox', { name: '最新发布' })).toBeVisible()

    // 检查快速筛选标签
    await expect(page.getByText('全部')).toBeVisible()
    await expect(page.getByText('Unity Assets')).toBeVisible()
    await expect(page.getByText('软件工具')).toBeVisible()
    await expect(page.getByText('设计素材')).toBeVisible()
    await expect(page.getByText('视频课程')).toBeVisible()
  })

  test('应该显示资源卡片', async ({ page }) => {
    // 检查第一个资源卡片
    await expect(page.getByText('Low Poly Shooter Pack')).toBeVisible()
    await expect(page.getByText('高质量的低多边形射击游戏资源包，包含角色、武器、环境等模型')).toBeVisible()
    await expect(page.getByText('🎮 Unity Assets')).toBeVisible()
    await expect(page.getByText('游戏资源')).toBeVisible()

    // 检查第二个资源卡片
    await expect(page.getByText('Blender 3D 建模工具')).toBeVisible()
    await expect(page.getByText('开源的3D建模和动画软件，功能强大且免费使用')).toBeVisible()
    await expect(page.getByText('⚙️ 软件工具')).toBeVisible()
    await expect(page.getByText('设计软件')).toBeVisible()

    // 检查第三个资源卡片
    await expect(page.getByText('UI设计系统组件库')).toBeVisible()
    await expect(page.getByText('现代化的UI设计组件和模板，包含图标、按钮、表单等元素')).toBeVisible()
    await expect(page.getByText('🎨 设计素材')).toBeVisible()
    await expect(page.getByText('UI设计')).toBeVisible()
  })

  test('应该显示资源元数据', async ({ page }) => {
    // 检查文件大小、版本、下载量等元数据
    await expect(page.getByText('125 MB')).toBeVisible()
    await expect(page.getByText('v3.0')).toBeVisible()
    await expect(page.getByText('1,234')).toBeVisible() // 下载量
    await expect(page.getByText('5,678')).toBeVisible() // 浏览量

    // 检查标签
    await expect(page.getByText('3D模型')).toBeVisible()
    await expect(page.getByText('射击游戏')).toBeVisible()
    await expect(page.getByText('Low Poly')).toBeVisible()
  })

  test('应该显示操作按钮', async ({ page }) => {
    // 检查查看详情和下载按钮
    const detailButtons = page.getByRole('button', { name: '查看详情' })
    const downloadButtons = page.getByRole('button', { name: '下载' })

    await expect(detailButtons.first()).toBeVisible()
    await expect(downloadButtons.first()).toBeVisible()
  })

  test('应该正确处理筛选功能', async ({ page }) => {
    // 选择特定资源类型
    await page.selectOption('select[name="type"]', 'unity-assets')

    // 验证筛选器已选择
    const selectedOption = await page.locator('select[name="type"]').inputValue()
    expect(selectedOption).toBe('unity-assets')

    // 点击资源类型标签
    await page.getByText('Unity Assets').click()
    // 这里只是验证交互不会出错，实际筛选逻辑需要后端支持
  })

  test('应该正确处理搜索功能', async ({ page }) => {
    // 输入搜索关键词
    await page.getByPlaceholder('搜索资源...').fill('Unity')

    // 清空搜索框
    await page.getByPlaceholder('搜索资源...').fill('')
    await expect(page.getByPlaceholder('搜索资源...')).toHaveValue('')
  })

  test('应该正确处理排序功能', async ({ page }) => {
    // 选择不同的排序选项
    await page.selectOption('select[name="sort"]', 'popular')
    await expect(page.locator('select[name="sort"]')).toHaveValue('popular')

    await page.selectOption('select[name="sort"]', 'views')
    await expect(page.locator('select[name="sort"]')).toHaveValue('views')

    await page.selectOption('select[name="sort"]', 'name')
    await expect(page.locator('select[name="sort"]')).toHaveValue('name')
  })

  test('应该显示分页功能', async ({ page }) => {
    // 检查分页组件
    await expect(page.getByRole('button', { name: '上一页' })).toBeVisible()
    await expect(page.getByRole('button', { name: '1' })).toBeVisible()
    await expect(page.getByRole('button', { name: '2' })).toBeVisible()
    await expect(page.getByRole('button', { name: '3' })).toBeVisible()
    await expect(page.getByRole('button', { name: '下一页' })).toBeVisible()

    // 上一页按钮应该被禁用（在第一页）
    await expect(page.getByRole('button', { name: '上一页' })).toBeDisabled()
  })

  test('应该正确处理导航', async ({ page }) => {
    // 测试返回首页按钮
    await page.getByRole('button', { name: '返回首页' }).click()
    await expect(page).toHaveURL('/')

    // 返回资源页
    await page.goto('/resources')

    // 测试导航栏的链接
    await page.getByRole('link', { name: 'ResLibs' }).click()
    await expect(page).toHaveURL('/')
  })

  test('应该显示页脚', async ({ page }) => {
    // 滚动到页脚
    await page.getByText('© 2025 ResLibs').scrollIntoViewIfNeeded()

    // 检查页脚内容
    await expect(page.getByText('ResLibs')).toBeVisible()
    await expect(page.getByText('© 2025 ResLibs. 保留所有权利。')).toBeVisible()
  })

  test('应该正确响应移动端布局', async ({ page }) => {
    // 切换到移动端视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 检查搜索和筛选区域是否适应移动端
    const searchSection = page.locator('.bg-white.p-6.rounded-lg')
    await expect(searchSection).toBeVisible()

    // 资源网格应该调整为单列
    const resourceGrid = page.locator('.grid.grid-cols-1')
    await expect(resourceGrid).toBeVisible()
  })

  test('应该正确处理资源卡片交互', async ({ page }) => {
    // 悬停在资源卡片上
    const resourceCard = page.locator('.group.hover\\:shadow-lg').first()
    await resourceCard.hover()

    // 检查悬停效果（标题应该变色）
    const cardTitle = resourceCard.locator('.group-hover\\:text-blue-600')
    await expect(cardTitle).toBeVisible()

    // 点击资源标题链接
    await cardTitle.click()
    await expect(page).toHaveURL('/resources/1')
  })

  test('应该正确处理按钮点击', async ({ page }) => {
    // 点击查看详情按钮
    await page.getByRole('button', { name: '查看详情' }).first().click()
    // 这里只是验证按钮可点击，实际页面跳转需要相应的路由

    // 返回资源页
    await page.goto('/resources')

    // 点击下载按钮
    await page.getByRole('button', { name: '下载' }).first().click()
    // 这里只是验证按钮可点击，实际下载功能需要后端支持
  })
})