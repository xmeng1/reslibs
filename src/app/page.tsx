import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Search, Download, Star, TrendingUp, Users, Shield } from 'lucide-react'
import { RESOURCE_TYPES } from '@/types/resource'

// 模拟热门资源数据
const featuredResources = [
  {
    id: '1',
    title: 'Low Poly Shooter Pack',
    description: '高质量的低多边形射击游戏资源包',
    type: 'unity-assets',
    typeName: 'Unity Assets',
    downloads: 1234,
    rating: 4.8,
    thumbnail: '/placeholder-thumb.jpg'
  },
  {
    id: '2',
    title: 'Blender 3D 建模工具',
    description: '开源的3D建模和动画软件',
    type: 'software-tools',
    typeName: '软件工具',
    downloads: 8901,
    rating: 4.9,
    thumbnail: '/placeholder-thumb.jpg'
  },
  {
    id: '3',
    title: 'UI设计系统组件库',
    description: '现代化的UI设计组件和模板',
    type: 'design-assets',
    typeName: '设计素材',
    downloads: 3456,
    rating: 4.7,
    thumbnail: '/placeholder-thumb.jpg'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                ResLibs
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                通用资源分享平台 - 支持 Unity Assets、软件工具、设计素材等多种资源类型
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="搜索 Unity Assets、软件工具、设计素材..."
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                  <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2">
                    搜索
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="px-8 py-3">
                  <Link href="/resources">浏览资源</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 py-3">
                  <Link href="/upload">上传资源</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Resource Type Filter */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer">
                全部类型
              </Badge>
              {RESOURCE_TYPES.map((type) => (
                <Badge
                  key={type.id}
                  variant="secondary"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {type.icon} {type.displayName}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Resources */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                热门资源
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                发现最受欢迎的优质资源，涵盖 Unity Assets、软件工具、设计素材等
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredResources.map((resource) => {
                const resourceType = RESOURCE_TYPES.find(t => t.name === resource.type)

                return (
                  <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {resourceType?.icon} {resource.typeName}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{resource.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        <Link href={`/resources/${resource.id}`}>
                          {resource.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Download className="w-4 h-4" />
                          <span>{resource.downloads.toLocaleString()}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          查看详情
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/resources">查看更多资源</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                为什么选择 ResLibs？
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                专业的资源管理平台，为开发者和设计师提供最优质的服务
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">多类型支持</h3>
                <p className="text-gray-600">
                  支持 Unity Assets、软件工具、设计素材、教育课程等多种资源类型
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">智能搜索</h3>
                <p className="text-gray-600">
                  强大的搜索和筛选功能，快速找到所需的资源
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">安全可靠</h3>
                <p className="text-gray-600">
                  所有资源经过审核，确保安全性和质量
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">社区驱动</h3>
                <p className="text-gray-600">
                  活跃的开发者社区，分享优质资源和经验
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Resource Types Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                支持的资源类型
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                涵盖开发者和设计师常用的各类资源
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {RESOURCE_TYPES.map((type) => (
                <Card key={type.id} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="text-4xl mb-2">{type.icon}</div>
                    <CardTitle className="text-lg">{type.displayName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {type.description}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/resources?type=${type.id}`}>
                        浏览资源
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              开始使用 ResLibs
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              加入我们的社区，获取最新的优质资源和技术分享
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/resources">立即开始</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/upload">上传资源</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}