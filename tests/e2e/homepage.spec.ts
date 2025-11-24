import { test, expect } from '@playwright/test'

test.describe('ResLibs 首页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('应该正确加载首页并显示主要内容', async ({ page }) => {
    // 检查标题
    await expect(page).toHaveTitle(/ResLibs/)

    // 检查主要标题
    await expect(page.getByRole('heading', { name: 'ResLibs' })).toBeVisible()

    // 检查描述文本
    await expect(page.getByText('通用资源分享平台 - 支持 Unity Assets、软件工具、设计素材等多种资源类型')).toBeVisible()

    // 检查导航栏
    await expect(page.getByRole('link', { name: 'ResLibs' })).toBeVisible()
    await expect(page.getByRole('link', { name: '资源库' })).toBeVisible()
    await expect(page.getByRole('link', { name: '分类' })).toBeVisible()
    await expect(page.getByRole('link', { name: '关于' })).toBeVisible()
    await expect(page.getByRole('button', { name: '管理后台' })).toBeVisible()
  })

  test('应该显示搜索功能', async ({ page }) => {
    // 检查导航栏中的搜索框
    const navSearch = page.getByPlaceholder('搜索资源...')
    await expect(navSearch).toBeVisible()

    // 检查 Hero 区域的搜索框
    const heroSearch = page.getByPlaceholder('搜索 Unity Assets、软件工具、设计素材...')
    await expect(heroSearch).toBeVisible()

    // 检查搜索按钮
    await expect(page.getByRole('button', { name: '搜索' })).toBeVisible()
  })

  test('应该显示资源类型筛选器', async ({ page }) => {
    // 检查资源类型标签
    await expect(page.getByText('全部类型')).toBeVisible()
    await expect(page.getByText('🎮 Unity Assets')).toBeVisible()
    await expect(page.getByText('⚙️ 软件工具')).toBeVisible()
    await expect(page.getByText('🎨 设计素材')).toBeVisible()
    await expect(page.getByText('📹 视频课程')).toBeVisible()
  })

  test('应该显示热门资源', async ({ page }) => {
    // 检查热门资源标题
    await expect(page.getByRole('heading', { name: '热门资源' })).toBeVisible()

    // 检查资源卡片
    await expect(page.getByText('Low Poly Shooter Pack')).toBeVisible()
    await expect(page.getByText('Blender 3D 建模工具')).toBeVisible()
    await expect(page.getByText('UI设计系统组件库')).toBeVisible()

    // 检查资源详情
    await expect(page.getByText('高质量的低多边形射击游戏资源包')).toBeVisible()
    await expect(page.getByText('开源的3D建模和动画软件')).toBeVisible()
    await expect(page.getByText('现代化的UI设计组件和模板')).toBeVisible()
  })

  test('应该显示功能特性', async ({ page }) => {
    // 检查特性标题
    await expect(page.getByRole('heading', { name: '为什么选择 ResLibs？' })).toBeVisible()

    // 检查特性卡片
    await expect(page.getByText('多类型支持')).toBeVisible()
    await expect(page.getByText('智能搜索')).toBeVisible()
    await expect(page.getByText('安全可靠')).toBeVisible()
    await expect(page.getByText('社区驱动')).toBeVisible()
  })

  test('应该显示支持的资源类型', async ({ page }) => {
    // 检查资源类型标题
    await expect(page.getByRole('heading', { name: '支持的资源类型' })).toBeVisible()

    // 检查各个资源类型卡片
    await expect(page.getByText('Unity 游戏引擎资源和工具')).toBeVisible()
    await expect(page.getByText('各种实用软件和开发工具')).toBeVisible()
    await expect(page.getByText('UI 设计素材、图标、图片等')).toBeVisible()
    await expect(page.getByText('教学视频和在线课程')).toBeVisible()
  })

  test('导航链接应该正确工作', async ({ page }) => {
    // 测试资源库链接
    await page.getByRole('link', { name: '资源库' }).click()
    await expect(page).toHaveURL('/resources')
    await expect(page.getByRole('heading', { name: '资源库' })).toBeVisible()

    // 返回首页
    await page.goBack()

    // 测试管理后台链接
    await page.getByRole('button', { name: '管理后台' }).click()
    await expect(page).toHaveURL('/admin')
  })

  test('主要按钮应该正确工作', async ({ page }) => {
    // 测试"浏览资源"按钮
    await page.getByRole('button', { name: '浏览资源' }).click()
    await expect(page).toHaveURL('/resources')

    // 返回首页
    await page.goto('/')

    // 测试"上传资源"按钮
    await page.getByRole('button', { name: '上传资源' }).click()
    await expect(page).toHaveURL('/upload')
  })

  test('应该显示页脚', async ({ page }) => {
    // 滚动到页脚
    await page.getByText('© 2025 ResLibs').scrollIntoViewIfNeeded()

    // 检查页脚内容
    await expect(page.getByText('ResLibs')).toBeVisible()
    await expect(page.getByText('通用资源分享平台，支持 Unity Assets、软件工具、设计素材等多种资源类型。')).toBeVisible()
    await expect(page.getByText('快速链接')).toBeVisible()
    await expect(page.getByText('支持')).toBeVisible()
    await expect(page.getByText('© 2025 ResLibs. 保留所有权利。')).toBeVisible()
  })

  test('应该显示移动端菜单', async ({ page }) => {
    // 切换到移动端视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 检查汉堡菜单按钮
    const menuButton = page.getByRole('button').first()
    await expect(menuButton).toBeVisible()

    // 点击菜单按钮
    await menuButton.click()

    // 检查移动端菜单内容
    await expect(page.getByRole('link', { name: '资源库' })).toBeVisible()
    await expect(page.getByRole('link', { name: '分类' })).toBeVisible()
    await expect(page.getByRole('link', { name: '关于' })).toBeVisible()
    await expect(page.getByPlaceholder('搜索资源...')).toBeVisible()
    await expect(page.getByRole('button', { name: '管理后台' })).toBeVisible()
  })

  test('应该处理搜索功能', async ({ page }) => {
    // 在搜索框中输入文本
    const searchInput = page.getByPlaceholder('搜索 Unity Assets、软件工具、设计素材...')
    await searchInput.fill('Unity Assets')

    // 点击搜索按钮
    await page.getByRole('button', { name: '搜索' }).click()

    // 验证搜索行为（这里只是验证输入不会导致错误）
    await expect(searchInput).toHaveValue('Unity Assets')
  })
})