import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始完整数据库初始化...')

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
    }),
    prisma.resourceType.upsert({
      where: { name: 'audio-music' },
      update: {},
      create: {
        name: 'audio-music',
        displayName: '音频音乐',
        description: '背景音乐、音效、音频素材等',
        icon: '🎵',
        fileExtensions: '.mp3,.wav,.ogg,.flac,.aac',
        defaultMetadata: '{"duration":"","bitrate":"","format":"","sampleRate":44100}',
        processingRules: '{"preview":true,"thumbnail":true,"metadataExtraction":true}'
      }
    }),
    prisma.resourceType.upsert({
      where: { name: 'documentation' },
      update: {},
      create: {
        name: 'documentation',
        displayName: '文档资料',
        description: '技术文档、教程、手册等',
        icon: '📚',
        fileExtensions: '.pdf,.md,.doc,.docx,.txt',
        defaultMetadata: '{"pages":"","format":"","language":"","difficulty":""}',
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
        description: '游戏开发相关资源，包括Unity、Unreal等游戏引擎资源',
        icon: '🎮',
        supportedTypes: 'unity-assets,software-tools,audio-music'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'design-creative' },
      update: {},
      create: {
        name: '设计创意',
        slug: 'design-creative',
        description: 'UI设计、平面设计、3D设计、动画等创意资源',
        icon: '🎨',
        supportedTypes: 'design-assets,software-tools,video-courses'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'education-learning' },
      update: {},
      create: {
        name: '教育学习',
        slug: 'education-learning',
        description: '编程教学、视频课程、学习资料等教育资源',
        icon: '📚',
        supportedTypes: 'video-courses,software-tools,documentation'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'development-tools' },
      update: {},
      create: {
        name: '开发工具',
        slug: 'development-tools',
        description: '编程工具、开发环境、调试工具等开发相关资源',
        icon: '⚙️',
        supportedTypes: 'software-tools,unity-assets,documentation'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web开发',
        slug: 'web-development',
        description: '前端框架、后端框架、数据库、API等Web开发资源',
        icon: '🌐',
        supportedTypes: 'software-tools,documentation'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'mobile-development' },
      update: {},
      create: {
        name: '移动开发',
        slug: 'mobile-development',
        description: 'iOS、Android、React Native、Flutter等移动开发资源',
        icon: '📱',
        supportedTypes: 'software-tools,documentation,video-courses'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'multimedia-production' },
      update: {},
      create: {
        name: '多媒体制作',
        slug: 'multimedia-production',
        description: '视频编辑、音频处理、3D建模、动画制作等多媒体资源',
        icon: '🎬',
        supportedTypes: 'software-tools,design-assets,audio-music,video-courses'
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
        resourceTypes: 'unity-assets,software-tools,design-assets,video-courses,audio-music,documentation',
        weight: 1
      }
    }),
    prisma.tag.upsert({
      where: { name: '优质' },
      update: {},
      create: {
        name: '优质',
        color: '#f59e0b',
        resourceTypes: 'unity-assets,software-tools,design-assets,video-courses,audio-music,documentation',
        weight: 2
      }
    }),
    prisma.tag.upsert({
      where: { name: '热门' },
      update: {},
      create: {
        name: '热门',
        color: '#ef4444',
        resourceTypes: 'unity-assets,software-tools,design-assets,video-courses,audio-music,documentation',
        weight: 3
      }
    }),
    prisma.tag.upsert({
      where: { name: '新手友好' },
      update: {},
      create: {
        name: '新手友好',
        color: '#3b82f6',
        resourceTypes: 'unity-assets,video-courses,software-tools',
        weight: 1
      }
    }),
    prisma.tag.upsert({
      where: { name: '开源' },
      update: {},
      create: {
        name: '开源',
        color: '#22c55e',
        resourceTypes: 'software-tools,design-assets,documentation',
        weight: 1
      }
    }),
    prisma.tag.upsert({
      where: { name: '专业版' },
      update: {},
      create: {
        name: '专业版',
        color: '#8b5cf6',
        resourceTypes: 'unity-assets,software-tools,design-assets',
        weight: 2
      }
    }),
    prisma.tag.upsert({
      where: { name: '教程' },
      update: {},
      create: {
        name: '教程',
        color: '#06b6d4',
        resourceTypes: 'video-courses,documentation',
        weight: 1
      }
    }),
    prisma.tag.upsert({
      where: { name: '素材包' },
      update: {},
      create: {
        name: '素材包',
        color: '#84cc16',
        resourceTypes: 'unity-assets,design-assets,audio-music',
        weight: 2
      }
    }),
    prisma.tag.upsert({
      where: { name: '完整项目' },
      update: {},
      create: {
        name: '完整项目',
        color: '#f97316',
        resourceTypes: 'unity-assets,documentation',
        weight: 3
      }
    }),
    prisma.tag.upsert({
      where: { name: '模板' },
      update: {},
      create: {
        name: '模板',
        color: '#ec4899',
        resourceTypes: 'design-assets,web-development,mobile-development',
        weight: 1
      }
    })
  ])

  // 4. 创建管理员用户
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

  // 5. 创建丰富的示例资源
  console.log('📦 创建示例资源...')
  const sampleResources = await Promise.all([
    // Unity Assets
    {
      title: 'Low Poly Shooter Pack',
      slug: 'low-poly-shooter-pack',
      description: '高质量的低多边形射击游戏资源包，包含角色、武器、环境、特效等完整游戏开发素材。适合制作各种射击类游戏。',
      thumbnail: '/assets/thumbnails/unity-shooter-pack.jpg',
      version: '2.1.0',
      status: 'published',
      publishedAt: new Date(),
      typeId: resourceTypes[0].id,
      categoryId: categories[0].id,
      fileSize: '156MB',
      metadata: '{"unityVersion":"2021.3.0","compatibility":["2021.3","2022.3","2023.2"],"dependencies":[],"assetCount":324,"shaderCount":45,"materialCount":89}',
      previews: '[{"type":"image","url":"/previews/unity-shooter-1.jpg"},{"type":"image","url":"/previews/unity-shooter-2.jpg"},{"type":"video","url":"/previews/unity-shooter-demo.mp4"}]',
      metaTitle: 'Low Poly Shooter Pack - Unity 游戏资源包',
      metaDescription: '专业的低多边形射击游戏资源包，包含完整的3D模型、材质、动画等游戏开发素材。',
      keywords: 'unity, low poly, shooter, game assets, 3d models, game development',
      downloadCount: 2847,
      viewCount: 15420,
      downloadLinks: [
        {
          provider: '官方下载',
          url: 'https://example.com/unity-shooter-pack',
          price: '免费',
          platform: 'All',
          quality: 'Original',
          isActive: true
        }
      ],
      tagIds: [tags[0].id, tags[1].id, tags[3].id, tags[4].id] // 免费, 优质, 新手友好, 开源, 素材包
    },

    // Software Tools
    {
      title: 'Blender 3D 建模软件',
      slug: 'blender-3d-modeling-tool',
      description: '开源的跨平台3D建模、动画、渲染软件。功能强大，支持建模、雕刻、动画、渲染、视频编辑和合成。',
      thumbnail: '/assets/thumbnails/blender-3d.jpg',
      version: '4.1.0',
      status: 'published',
      publishedAt: new Date(),
      typeId: resourceTypes[1].id,
      categoryId: categories[3].id,
      fileSize: '280MB',
      metadata: '{"systemRequirements":{"os":["Windows","macOS","Linux"],"memory":"8GB RAM","storage":"2GB","graphics":"OpenGL 3.3+"},"version":"4.1.0","platform":["windows","macos","linux"],"license":"GPL","developer":"Blender Foundation","features":["3D建模","雕刻","动画","渲染","视频编辑","合成"],"supportedFormats":["obj","fbx","dae","ply","stl"]}',
      previews: '[{"type":"image","url":"/previews/blender-interface.jpg"},{"type":"video","url":"/previews/blender-tutorial.mp4"}]',
      metaTitle: 'Blender 3D 建模软件 - 免费开源3D工具',
      metaDescription: '专业的开源3D建模软件，适用于建模、动画、渲染等多种用途。',
      keywords: 'blender, 3d modeling, animation, rendering, open source, free',
      downloadCount: 15234,
      viewCount: 45678,
      downloadLinks: [
        {
          provider: '官网下载',
          url: 'https://blender.org/download',
          price: '免费',
          platform: 'All',
          quality: 'Latest',
          isActive: true
        }
      ],
      tagIds: [tags[0].id, tags[2].id, tags[4].id] // 免费, 热门, 开源
    },

    // Design Assets
    {
      title: 'Modern UI Design System',
      slug: 'modern-ui-design-system-components',
      description: '现代化的UI设计系统和组件库，包含完整的设计规范、组件库、图标集和模板。支持Web、移动端和桌面应用。',
      thumbnail: '/assets/thumbnails/ui-system.jpg',
      version: '3.0.0',
      status: 'published',
      publishedAt: new Date(),
      typeId: resourceTypes[2].id,
      categoryId: categories[1].id,
      fileSize: '45MB',
      metadata: '{"resolution":"2x, 3x, 4x","format":"Figma, Sketch, PSD, AI","license":"MIT","componentCount":500+" ,"styleGuide":true,"colorPalette":true,"iconSet":true,"responsive":true}',
      previews: '[{"type":"image","url":"/previews/ui-components.jpg"},{"type":"image","url":"/previews/ui-colors.jpg"},{"type":"image","url":"/previews/ui-icons.jpg"}]',
      metaTitle: 'Modern UI Design System - 完整设计资源包',
      metaDescription: '现代化的UI设计系统，包含完整的组件库、设计规范和视觉资源。',
      keywords: 'ui, design system, components, figma, sketch, modern, responsive',
      downloadCount: 8765,
      viewCount: 23456,
      downloadLinks: [
        {
          provider: '官方资源库',
          url: 'https://example.com/ui-system',
          price: '免费',
          platform: 'All',
          quality: 'Original',
          isActive: true
        }
      ],
      tagIds: [tags[0].id, tags[1].id, tags[8].id, tags[5].id] // 免费, 优质, 模板, 专业版, 开源
    },

    // Video Courses
    {
      title: 'Unity游戏开发完整教程',
      slug: 'unity-game-development-complete-course',
      description: '从零开始学习Unity游戏开发的完整视频教程，涵盖C#编程、Unity界面、2D/3D游戏开发、发布上线等全流程。',
      thumbnail: '/assets/thumbnails/unity-course.jpg',
      version: '1.0.0',
      status: 'published',
      publishedAt: new Date(),
      typeId: resourceTypes[3].id,
      categoryId: categories[0].id,
      fileSize: '8.5GB',
      metadata: '{"duration":"25小时","quality":"1080p","language":"中文","subtitles":["中文","英文"],"level":"初级-中级","chapters":45,"projectFiles":true,"assignments":20,"certificate":true}',
      previews: '[{"type":"video","url":"/previews/unity-course-trailer.mp4"},{"type":"image","url":"/previews/unity-course-contents.jpg"}]',
      metaTitle: 'Unity游戏开发完整教程 - 从零到项目上线',
      metaDescription: '完整的Unity游戏开发教程，适合初学者系统学习游戏开发技能。',
      keywords: 'unity, game development, tutorial, csharp, programming, video course',
      downloadCount: 6543,
      viewCount: 32109,
      downloadLinks: [
        {
          provider: '课程平台',
          url: 'https://example.com/unity-course',
          price: '¥199',
          platform: 'All',
          quality: '1080p',
          isActive: true
        }
      ],
      tagIds: [tags[6].id, tags[1].id, tags[3].id] // 教程, 优质, 新手友好
    },

    // Audio Music
    {
      title: 'RPG游戏背景音乐集',
      slug: 'rpg-game-background-music-collection',
      description: '专为RPG游戏设计的背景音乐集，包含战斗、城镇、地下城、森林等不同场景的高品质音乐文件。',
      thumbnail: '/assets/thumbnails/rpg-music.jpg',
      version: '1.5.0',
      status: 'published',
      publishedAt: new Date(),
      typeId: resourceTypes[4].id,
      categoryId: categories[0].id,
      fileSize: '320MB',
      metadata: '{"duration":"2小时30分钟","bitrate":"320kbps","format":"MP3, WAV, OGG","sampleRate":44100,"tempo":["60-180"],"mood":["epic","calm","battle","mysterious"],"instruments":["orchestra","piano","strings"],"loops":true}',
      previews: '[{"type":"audio","url":"/previews/rpg-battle-music.mp3"},{"type":"audio","url":"/previews/rpg-town-music.mp3"}]',
      metaTitle: 'RPG游戏背景音乐集 - 专业游戏音频素材',
      metaDescription: '高质量的RPG游戏背景音乐，适合各种游戏场景使用。',
      keywords: 'rpg, game music, background music, game audio, loops, orchestral',
      downloadCount: 4321,
      viewCount: 12765,
      downloadLinks: [
        {
          provider: '音乐库',
          url: 'https://example.com/rpg-music-pack',
          price: '¥99',
          platform: 'All',
          quality: '320kbps',
          isActive: true
        }
      ],
      tagIds: [tags[7].id, tags[1].id, tags[2].id] // 素材包, 优质, 热门
    },

    // Documentation
    {
      title: 'React 开发完整指南',
      slug: 'react-development-complete-guide',
      description: 'React前端开发的完整学习指南，包含基础语法、Hooks、状态管理、路由、性能优化等核心内容，附带实战项目。',
      thumbnail: '/assets/thumbnails/react-guide.jpg',
      version: '18.2.0',
      status: 'published',
      publishedAt: new Date(),
      typeId: resourceTypes[5].id,
      categoryId: categories[4].id,
      fileSize: '125MB',
      metadata: '{"pages":850,"format":"PDF, EPUB, Markdown","language":"中文","difficulty":"中级","readingTime":"40小时","codeExamples":500+,"liveDemo":true,"exercises":100,"updates":"持续更新"}',
      previews: '[{"type":"image","url":"/previews/react-guide-cover.jpg"},{"type":"image","url":"/previews/react-guide-contents.jpg"}]',
      metaTitle: 'React 开发完整指南 - 全面的React学习资源',
      metaDescription: '完整的React开发指南，涵盖从基础到高级的所有知识点。',
      keywords: 'react, frontend, javascript, web development, guide, tutorial',
      downloadCount: 9876,
      viewCount: 56432,
      downloadLinks: [
        {
          provider: '技术书店',
          url: 'https://example.com/react-guide',
          price: '¥79',
          platform: 'All',
          quality: 'Original',
          isActive: true
        }
      ],
      tagIds: [tags[6].id, tags[1].id, tags[4].id, tags[3].id] // 教程, 优质, 开源, 新手友好
    }
  ])

  // 5. 创建资源记录（使用单独创建以支持关系）
  console.log('📦 创建示例资源...')
  const createdResources = []

  for (const resourceData of sampleResources) {
    // 提取关系数据
    const { tagIds, downloadLinks, ...resourceFields } = resourceData

    // 确保slug唯一性（添加时间戳）
    const uniqueSlug = `${resourceFields.slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 创建资源
    const resource = await prisma.resource.create({
      data: {
        ...resourceFields,
        slug: uniqueSlug
      }
    })

    createdResources.push(resource)

    // 创建下载链接
    if (downloadLinks && downloadLinks.length > 0) {
      for (const link of downloadLinks) {
        await prisma.downloadLink.create({
          data: {
            resourceId: resource.id,
            ...link
          }
        })
      }
    }

    // 创建标签关联
    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await prisma.resourceTag.create({
          data: {
            resourceId: resource.id,
            tagId: tagId
          }
        })
      }
    }
  }

  console.log('✅ 完整数据库初始化完成!')
  console.log(`
📊 初始化数据统计:
  - 资源类型: ${resourceTypes.length}
  - 分类: ${categories.length}
  - 标签: ${tags.length}
  - 示例资源: ${createdResources.length}
  - 管理员用户: 1

🎯 资源类型:
${resourceTypes.map(type => `  - ${type.icon} ${type.displayName}: ${type.description}`).join('\n')}

📁 分类结构:
${categories.map(cat => `  - ${cat.icon} ${cat.name}: ${cat.description}`).join('\n')}

🏷️ 标签系统:
${tags.map(tag => `  - ${tag.name} (${tag.color}): 适用于 ${tag.resourceTypes.split(',').join(', ')}`).join('\n')}

🔑 管理员登录信息:
  用户名: admin
  邮箱: admin@reslibs.com
  密码: admin123456

🌐 访问地址:
  前台: http://localhost:3000
  管理后台: http://localhost:3000/admin/login

📈 资源统计:
  - Unity Assets: ${createdResources.filter(r => r.typeId === resourceTypes[0].id).length}
  - 软件工具: ${createdResources.filter(r => r.typeId === resourceTypes[1].id).length}
  - 设计素材: ${createdResources.filter(r => r.typeId === resourceTypes[2].id).length}
  - 视频课程: ${createdResources.filter(r => r.typeId === resourceTypes[3].id).length}
  - 音频音乐: ${createdResources.filter(r => r.typeId === resourceTypes[4].id).length}
  - 文档资料: ${createdResources.filter(r => r.typeId === resourceTypes[5].id).length}

系统已准备就绪，包含丰富的测试数据供E2E测试使用！
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