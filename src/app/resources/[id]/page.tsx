import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Eye,
  Heart,
  Share2,
  Star,
  Calendar,
  FileText,
  User,
  Tag
} from 'lucide-react'

// 模拟资源数据（实际应用中应该从API获取）
const mockResource = {
  id: '1',
  title: 'Low Poly Shooter Pack',
  description: `这是一个高质量的低多边形射击游戏资源包，包含完整的3D模型、纹理和动画。

  主要特性：
  • 50+ 精美的低多边形3D模型
  • 高质量的PBR纹理材质
  • 完整的角色动画系统
  • 优化的性能表现
  • 适用于移动端和PC端

  该资源包非常适合用于制作低多边形风格的射击游戏，所有模型都经过精心设计和优化，
  可以直接导入到Unity项目中使用。`,
  longDescription: '详细的资源描述内容，包含更多技术细节和使用说明...',
  thumbnail: '/placeholder-thumb.jpg',
  screenshots: [
    '/screenshot1.jpg',
    '/screenshot2.jpg',
    '/screenshot3.jpg'
  ],
  type: 'unity-assets',
  typeName: 'Unity Assets',
  category: '3D模型',
  tags: ['3D模型', '射击游戏', 'Low Poly', 'Unity', '游戏资源'],
  fileSize: '125 MB',
  version: 'v3.0',
  author: {
    name: '开发者小明',
    avatar: '/avatar.jpg',
    bio: '专注于Unity开发的独立开发者'
  },
  stats: {
    downloads: 1234,
    views: 5678,
    rating: 4.8,
    ratingCount: 156
  },
  downloadLinks: [
    {
      provider: '官方下载',
      url: '#',
      speed: '高速',
      platform: '全平台'
    },
    {
      provider: '备用链接1',
      url: '#',
      speed: '普通',
      platform: 'PC/Mac'
    }
  ],
  technicalInfo: {
    unityVersion: '2021.3+',
    compatibility: ['PC', 'Mobile', 'WebGL'],
    dependencies: [],
    lastUpdate: '2024-01-15'
  },
  createdAt: '2024-01-15',
  updatedAt: '2024-01-15'
}

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* 面包屑导航 */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              首页
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/resources" className="text-gray-600 hover:text-gray-900">
              资源库
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{mockResource.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 主要内容区 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 头部信息 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary">
                    {mockResource.typeName}
                  </Badge>
                  <Badge variant="outline">
                    {mockResource.category}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {mockResource.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6">
                  {mockResource.description}
                </p>

                {/* 统计信息 */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Download className="w-5 h-5" />
                    <span>{mockResource.stats.downloads.toLocaleString()} 下载</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-5 h-5" />
                    <span>{mockResource.stats.views.toLocaleString()} 浏览</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{mockResource.stats.rating}</span>
                    <span className="text-gray-500">({mockResource.stats.ratingCount} 评价)</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="flex-1 min-w-[200px]">
                    <Download className="w-5 h-5 mr-2" />
                    立即下载
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart className="w-5 h-5 mr-2" />
                    收藏
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="w-5 h-5 mr-2" />
                    分享
                  </Button>
                </div>
              </div>

              {/* 截图预览 */}
              <Card>
                <CardHeader>
                  <CardTitle>资源截图</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">主截图</span>
                    </div>
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">截图 2</span>
                    </div>
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">截图 3</span>
                    </div>
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">更多截图</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 详细描述 */}
              <Card>
                <CardHeader>
                  <CardTitle>详细描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {mockResource.longDescription}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 技术信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>技术信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Unity 版本：</span>
                      <span className="text-gray-600 ml-2">{mockResource.technicalInfo.unityVersion}</span>
                    </div>
                    <div>
                      <span className="font-semibold">支持平台：</span>
                      <span className="text-gray-600 ml-2">
                        {mockResource.technicalInfo.compatibility.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">文件大小：</span>
                      <span className="text-gray-600 ml-2">{mockResource.fileSize}</span>
                    </div>
                    <div>
                      <span className="font-semibold">版本：</span>
                      <span className="text-gray-600 ml-2">{mockResource.version}</span>
                    </div>
                    <div>
                      <span className="font-semibold">最后更新：</span>
                      <span className="text-gray-600 ml-2">{mockResource.technicalInfo.lastUpdate}</span>
                    </div>
                    <div>
                      <span className="font-semibold">上传时间：</span>
                      <span className="text-gray-600 ml-2">{mockResource.createdAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 标签 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    标签
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockResource.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-gray-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 下载选项 */}
              <Card>
                <CardHeader>
                  <CardTitle>下载选项</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockResource.downloadLinks.map((link, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{link.provider}</span>
                        <Badge variant="outline">{link.speed}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        平台: {link.platform}
                      </div>
                      <Button className="w-full" variant="outline">
                        下载
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 作者信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    作者信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-semibold">{mockResource.author.name}</div>
                      <div className="text-sm text-gray-600">{mockResource.author.bio}</div>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    关注作者
                  </Button>
                </CardContent>
              </Card>

              {/* 相关资源 */}
              <Card>
                <CardHeader>
                  <CardTitle>相关资源</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: 'FPS Weapon Pack', type: 'Unity Assets', downloads: 890 },
                    { title: 'Character Controller', type: 'Unity Assets', downloads: 456 },
                    { title: 'Environment Assets', type: 'Unity Assets', downloads: 234 }
                  ].map((resource, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium text-sm mb-1">{resource.title}</div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{resource.type}</span>
                        <span>{resource.downloads} 下载</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}