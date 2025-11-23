import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, Download, Eye } from 'lucide-react'
import { RESOURCE_TYPES } from '@/types/resource'

// 模拟数据 - 后续将替换为真实的数据库查询
const mockResources = [
  {
    id: '1',
    title: 'Low Poly Shooter Pack',
    description: '高质量的低多边形射击游戏资源包，包含角色、武器、环境等模型',
    thumbnail: '/placeholder-image.jpg',
    fileSize: '125 MB',
    version: 'v3.0',
    typeName: 'unity-assets',
    categoryName: '游戏资源',
    tags: ['3D模型', '射击游戏', 'Low Poly'],
    downloadCount: 1234,
    viewCount: 5678,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Blender 3D 建模工具',
    description: '开源的3D建模和动画软件，功能强大且免费使用',
    thumbnail: '/placeholder-image.jpg',
    fileSize: '280 MB',
    version: 'v4.2.1',
    typeName: 'software-tools',
    categoryName: '设计软件',
    tags: ['3D建模', '动画', '开源软件'],
    downloadCount: 8901,
    viewCount: 12456,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'UI设计系统组件库',
    description: '现代化的UI设计组件和模板，包含图标、按钮、表单等元素',
    thumbnail: '/placeholder-image.jpg',
    fileSize: '45 MB',
    version: 'v2.5',
    typeName: 'design-assets',
    categoryName: 'UI设计',
    tags: ['UI组件', '图标', '设计系统'],
    downloadCount: 3456,
    viewCount: 7890,
    createdAt: new Date('2024-01-08')
  }
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">资源库</h1>
              <p className="text-gray-600 mt-1">发现和下载优质的各类资源</p>
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 搜索和筛选区域 */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="搜索资源..."
                className="pl-10"
              />
            </div>

            {/* 资源类型筛选 */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select className="border rounded-md px-3 py-2 bg-white">
                <option value="">所有类型</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序选项 */}
            <select className="border rounded-md px-3 py-2 bg-white">
              <option value="latest">最新发布</option>
              <option value="popular">最多下载</option>
              <option value="views">最多浏览</option>
              <option value="name">按名称</option>
            </select>
          </div>

          {/* 快速筛选标签 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['全部', 'Unity Assets', '软件工具', '设计素材', '视频课程'].map((tag) => (
              <Badge
                key={tag}
                variant={tag === '全部' ? 'default' : 'secondary'}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* 资源网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockResources.map((resource) => {
            const resourceType = RESOURCE_TYPES.find(t => t.name === resource.typeName)

            return (
              <Card key={resource.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {resourceType?.icon} {resourceType?.displayName}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.categoryName}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    <Link href={`/resources/${resource.id}`}>
                      {resource.title}
                    </Link>
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{resource.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* 元数据 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{resource.fileSize}</span>
                    <span>{resource.version}</span>
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloadCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{resource.viewCount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      查看详情
                    </Button>
                    <Button size="sm" variant="outline">
                      下载
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 空状态 */}
        {mockResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无资源</h3>
            <p className="text-gray-500">
              当前没有符合筛选条件的资源，请尝试调整筛选条件。
            </p>
          </div>
        )}

        {/* 分页 */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              上一页
            </Button>
            <Button variant="outline">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">下一页</Button>
          </div>
        </div>
      </div>
    </div>
  )
}