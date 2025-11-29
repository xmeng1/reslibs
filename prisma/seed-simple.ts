import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始数据库初始化...')

  // 1. 创建默认资源类型
  console.log('📝 创建资源类型...')
  const resourceTypes = await Promise.all([
    prisma.resourceType.upsert({
      where: { name: 'unity-assets' },
      update: {},
      create: {
        name: 'unity-assets',
        displayName: 'Unity Assets',
        description: 'Unity 游戏引擎资源和工具',
        icon: '🎮',
        fileExtensions: '.unitypackage,.unity,.asset',
        defaultMetadata: '{"unityVersion":"","compatibility":[],"dependencies":[]}',
        processingRules: '{"preview":true,"thumbnail":true,"metadataExtraction":true}'
      }
    }),
    prisma.resourceType.upsert({
      where: { name: 'software-tools' },
      update: {},
      create: {
        name: 'software-tools',
        displayName: '软件工具',
        description: '各种实用软件和开发工具',
        icon: '⚙️',
        fileExtensions: '.exe,.msi,.dmg,.pkg,.deb,.rpm',
        defaultMetadata: '{"systemRequirements":{},"version":"","platform":["windows","macos","linux"]}',
        processingRules: '{"preview":true,"thumbnail":true,"metadataExtraction":true}'
      }
    }),
    prisma.resourceType.upsert({
      where: { name: 'design-assets' },
      update: {},
      create: {
        name: 'design-assets',
        displayName: '设计素材',
        description: 'UI 设计素材、图标、图片等',
        icon: '🎨',
        fileExtensions: '.psd,.ai,.sketch,.fig,.png,.jpg,.svg',
        defaultMetadata: '{"resolution":"","format":"","license":""}',
        processingRules: '{"preview":true,"thumbnail":true,"metadataExtraction":true}'
      }
    }),
    prisma.resourceType.upsert({
      where: { name: 'video-courses' },
      update: {},
      create: {
        name: 'video-courses',
        displayName: '视频课程',
        description: '教学视频和在线课程',
        icon: '📹',
        fileExtensions: '.mp4,.avi,.mov,.mkv',
        defaultMetadata: '{"duration":"","quality":"","language":"","subtitles":[]}',
        processingRules: '{"preview":true,"thumbnail":true,"metadataExtraction":true}'
      }
    })
  ])

  // 2. 创建默认分类
  console.log('📂 创建分类...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'game-development' },
      update: {},
      create: {
        name: '游戏开发',
        slug: 'game-development',
        description: '游戏开发相关资源',
        icon: '🎮',
        supportedTypes: 'unity-assets,software-tools'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'design-creative' },
      update: {},
      create: {
        name: '设计创意',
        slug: 'design-creative',
        description: '设计和创意素材',
        icon: '🎨',
        supportedTypes: 'design-assets,software-tools'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'education-learning' },
      update: {},
      create: {
        name: '教育学习',
        slug: 'education-learning',
        description: '教育和学习资源',
        icon: '📚',
        supportedTypes: 'video-courses,software-tools'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'development-tools' },
      update: {},
      create: {
        name: '开发工具',
        slug: 'development-tools',
        description: '开发和编程工具',
        icon: '⚙️',
        supportedTypes: 'software-tools,unity-assets'
      }
    })
  ])

  // 3. 创建标签
  console.log('🏷️ 创建标签...')
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: '免费' },
      update: {},
      create: {
        name: '免费',
        color: '#10b981',
        resourceTypes: 'unity-assets,software-tools,design-assets,video-courses',
        weight: 1
      }
    }),
    prisma.tag.upsert({
      where: { name: '优质' },
      update: {},
      create: {
        name: '优质',
        color: '#f59e0b',
        resourceTypes: 'unity-assets,software-tools,design-assets,video-courses',
        weight: 2
      }
    }),
    prisma.tag.upsert({
      where: { name: '热门' },
      update: {},
      create: {
        name: '热门',
        color: '#ef4444',
        resourceTypes: 'unity-assets,software-tools,design-assets,video-courses',
        weight: 3
      }
    }),
    prisma.tag.upsert({
      where: { name: '新手友好' },
      update: {},
      create: {
        name: '新手友好',
        color: '#3b82f6',
        resourceTypes: 'unity-assets,video-courses',
        weight: 1
      }
    })
  ])

  // 4. 创建默认管理员用户
  console.log('👤 创建管理员用户...')
  const adminPassword = await bcrypt.hash('admin123456', 12)
  const adminUser = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@reslibs.com',
      password: adminPassword,
      name: '系统管理员',
      role: 'super_admin',
      isActive: true
    }
  })

  // 5. 创建示例资源
  console.log('📦 创建示例资源...')
  const sampleResources = await Promise.all([
    prisma.resource.create({
      data: {
        title: 'Low Poly Shooter Pack',
        slug: 'low-poly-shooter-pack',
        description: '高质量的低多边形射击游戏资源包，包含角色、武器、环境等多种素材。',
        thumbnail: '/placeholder-thumb.jpg',
        version: '1.2.0',
        status: 'published',
        publishedAt: new Date(),
        typeId: resourceTypes[0].id, // unity-assets
        categoryId: categories[0].id, // game-development
        metadata: '{"unityVersion":"2021.3.0","compatibility":["2021.3","2022.3","2023.2"],"dependencies":[],"fileSize":"125MB","assetCount":156}',
        previews: '[{"type":"image","url":"/preview1.jpg"},{"type":"image","url":"/preview2.jpg"}]',
        metaTitle: 'Low Poly Shooter Pack - Unity 资源包',
        metaDescription: '专业的低多边形射击游戏资源包，包含完整的游戏开发素材。',
        keywords: 'unity, low poly, shooter, 游戏素材',
        downloadCount: 1234,
        viewCount: 5678,
        downloadLinks: {
          create: [
            {
              provider: '官方下载',
              url: 'https://example.com/download',
              price: '免费',
              platform: 'All',
              quality: 'Original',
              isActive: true
            }
          ]
        }
      }
    }),
    prisma.resource.create({
      data: {
        title: 'Blender 3D 建模工具',
        slug: 'blender-3d-modeling-tool',
        description: '开源的3D建模和动画软件，功能强大且完全免费。',
        thumbnail: '/placeholder-thumb.jpg',
        version: '4.1.0',
        status: 'published',
        publishedAt: new Date(),
        typeId: resourceTypes[1].id, // software-tools
        categoryId: categories[3].id, // development-tools
        metadata: '{"systemRequirements":{"os":["Windows","macOS","Linux"],"memory":"8GB RAM","storage":"2GB","graphics":"OpenGL 3.3+"},"version":"4.1.0","platform":["windows","macos","linux"],"license":"GPL","developer":"Blender Foundation"}',
        previews: '[{"type":"image","url":"/blender-preview1.jpg"}]',
        metaTitle: 'Blender 3D 建模软件 - 免费下载',
        metaDescription: '专业的开源3D建模软件，适用于建模、动画、渲染等多种用途。',
        keywords: 'blender, 3d, modeling, animation, 开源',
        downloadCount: 8901,
        viewCount: 23456,
        downloadLinks: {
          create: [
            {
              provider: '官网下载',
              url: 'https://blender.org/download',
              price: '免费',
              platform: 'All',
              quality: 'Latest',
              isActive: true
            }
          ]
        }
      }
    }),
    prisma.resource.create({
      data: {
        title: 'UI设计系统组件库',
        slug: 'ui-design-system-components',
        description: '现代化的UI设计组件和模板，包含完整的视觉设计系统。',
        thumbnail: '/placeholder-thumb.jpg',
        version: '2.0.0',
        status: 'published',
        publishedAt: new Date(),
        typeId: resourceTypes[2].id, // design-assets
        categoryId: categories[1].id, // design-creative
        metadata: '{"resolution":"2x, 3x","format":"Figma, Sketch, PSD","license":"MIT","componentCount":200,"styleGuide":true}',
        previews: '[{"type":"image","url":"/ui-preview1.jpg"},{"type":"image","url":"/ui-preview2.jpg"}]',
        metaTitle: 'UI设计系统组件库 - 完整设计资源',
        metaDescription: '现代化的UI设计系统，包含完整的组件库和设计规范。',
        keywords: 'ui, design system, components, figma, sketch',
        downloadCount: 3456,
        viewCount: 12345,
        downloadLinks: {
          create: [
            {
              provider: '资源下载',
              url: 'https://example.com/ui-components',
              price: '免费',
              platform: 'All',
              quality: 'Original',
              isActive: true
            }
          ]
        }
      }
    })
  ])

  // 6. 为示例资源添加标签关联
  console.log('🔗 添加标签关联...')
  await Promise.all([
    // 第一个资源：免费 + 优质
    prisma.resourceTag.create({
      data: {
        resourceId: sampleResources[0].id,
        tagId: tags[0].id // 免费
      }
    }),
    prisma.resourceTag.create({
      data: {
        resourceId: sampleResources[0].id,
        tagId: tags[1].id // 优质
      }
    }),
    // 第二个资源：免费 + 热门
    prisma.resourceTag.create({
      data: {
        resourceId: sampleResources[1].id,
        tagId: tags[0].id // 免费
      }
    }),
    prisma.resourceTag.create({
      data: {
        resourceId: sampleResources[1].id,
        tagId: tags[2].id // 热门
      }
    }),
    // 第三个资源：免费 + 优质 + 新手友好
    prisma.resourceTag.create({
      data: {
        resourceId: sampleResources[2].id,
        tagId: tags[0].id // 免费
      }
    }),
    prisma.resourceTag.create({
      data: {
        resourceId: sampleResources[2].id,
        tagId: tags[1].id // 优质
      }
    }),
    prisma.resourceTag.create({
      data: {
        resourceId: sampleResources[2].id,
        tagId: tags[3].id // 新手友好
      }
    })
  ])

  console.log('✅ 数据库初始化完成!')
  console.log(`
📊 初始化数据统计:
  - 资源类型: ${resourceTypes.length}
  - 分类: ${categories.length}
  - 标签: ${tags.length}
  - 管理员用户: 1
  - 示例资源: ${sampleResources.length}

🔑 管理员登录信息:
  用户名: admin
  邮箱: admin@reslibs.com
  密码: admin123456

🌐 访问管理后台: http://localhost:3000/admin
  `)
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })