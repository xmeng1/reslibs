// 资源类型定义
export interface ResourceType {
  id: string
  name: string
  displayName: string
  description?: string
  icon?: string
  fileExtensions: string[]
  defaultMetadata: any
}

// 分类定义
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parentId?: string
  supportedTypes: string[]
}

// 标签定义
export interface Tag {
  id: string
  name: string
  color?: string
  icon?: string
  resourceTypes: string[]
  weight: number
}

// 下载链接定义
export interface DownloadLink {
  id: string
  provider: string
  url: string
  price?: string
  platform?: string
  quality?: string
  isActive: boolean
  metadata?: any
}

// 资源定义
export interface Resource {
  id: string
  title: string
  slug: string
  description: string
  thumbnail?: string
  fileSize?: string
  version?: string
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  typeId: string
  categoryId: string
  metadata: any
  previews: any[]
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  downloadCount: number
  viewCount: number
  createdAt: Date
  updatedAt: Date

  // 关联数据
  type?: ResourceType
  category?: Category
  tags?: Tag[]
  downloadLinks?: DownloadLink[]
}

// 预定义的资源类型
export const RESOURCE_TYPES: ResourceType[] = [
  {
    id: 'unity-assets',
    name: 'unity-assets',
    displayName: 'Unity Assets',
    description: 'Unity 游戏引擎资源和工具',
    icon: '🎮',
    fileExtensions: ['.unitypackage', '.unity', '.asset'],
    defaultMetadata: {
      unityVersion: '',
      compatibility: [],
      dependencies: []
    }
  },
  {
    id: 'software-tools',
    name: 'software-tools',
    displayName: '软件工具',
    description: '各种实用软件和开发工具',
    icon: '⚙️',
    fileExtensions: ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm'],
    defaultMetadata: {
      systemRequirements: {},
      version: '',
      platform: ['windows', 'macos', 'linux']
    }
  },
  {
    id: 'design-assets',
    name: 'design-assets',
    displayName: '设计素材',
    description: 'UI 设计素材、图标、图片等',
    icon: '🎨',
    fileExtensions: ['.psd', '.ai', '.sketch', '.fig', '.png', '.jpg', '.svg'],
    defaultMetadata: {
      resolution: '',
      format: '',
      license: ''
    }
  },
  {
    id: 'video-courses',
    name: 'video-courses',
    displayName: '视频课程',
    description: '教学视频和在线课程',
    icon: '📹',
    fileExtensions: ['.mp4', '.avi', '.mov', '.mkv'],
    defaultMetadata: {
      duration: '',
      quality: '',
      language: '',
      subtitles: []
    }
  }
]