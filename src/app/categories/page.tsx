import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RESOURCE_TYPES } from '@/types/resource'

// 模拟分类数据
const categories = [
  {
    id: 'unity',
    name: 'Unity 开发',
    description: 'Unity 游戏开发相关资源和工具',
    icon: '🎮',
    resourceCount: 156,
    subcategories: ['3D模型', 'Shader', '插件工具', '音频资源']
  },
  {
    id: 'software',
    name: '软件工具',
    description: '开发和设计相关软件工具',
    icon: '⚙️',
    resourceCount: 89,
    subcategories: ['开发工具', '设计软件', '效率工具', '系统工具']
  },
  {
    id: 'design',
    name: '设计素材',
    description: 'UI/UX 设计相关素材和模板',
    icon: '🎨',
    resourceCount: 234,
    subcategories: ['图标设计', '界面模板', '字体资源', '配色方案']
  },
  {
    id: 'education',
    name: '教育课程',
    description: '编程和技术学习相关课程',
    icon: '📚',
    resourceCount: 67,
    subcategories: ['编程教程', '设计课程', '技术分享', '实战项目']
  }
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">资源分类</h1>
              <p className="text-gray-600 mt-1">浏览不同类型的资源分类</p>
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 分类网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {categories.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <Badge variant="secondary">
                    {category.resourceCount} 个资源
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  <Link href={`/categories/${category.id}`}>
                    {category.name}
                  </Link>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">子分类：</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub) => (
                      <Badge key={sub} variant="outline" className="text-xs">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full">
                  浏览分类
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 资源类型快速访问 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">按资源类型浏览</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RESOURCE_TYPES.map((type) => (
              <Link
                key={type.id}
                href={`/resources?type=${type.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <div className="font-semibold">{type.displayName}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}