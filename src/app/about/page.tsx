import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Twitter, Mail, Users, Target, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              关于 ResLibs
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              我们致力于为开发者和设计师打造最优质的资源分享平台，
              让创意和技术能够更好地结合，推动数字内容的创作与发展。
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">我们的使命</h2>
                <p className="text-lg text-gray-600 mb-4">
                  ResLibs 专注于构建一个开放、高效、优质的数字资源生态系统。
                  我们相信通过共享和协作，能够让创意和技术更好地结合，
                  推动整个数字内容创作行业的发展。
                </p>
                <p className="text-lg text-gray-600">
                  无论您是独立开发者、设计团队还是创意工作者，
                  都能在这里找到所需的优质资源和灵感。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">10,000+</div>
                    <div className="text-sm text-gray-600">活跃用户</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">5,000+</div>
                    <div className="text-sm text-gray-600">优质资源</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">99.9%</div>
                    <div className="text-sm text-gray-600">可用性</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-600">技术支持</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">为什么选择我们？</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">高质量资源</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    所有资源都经过专业团队审核，确保质量和可用性。
                    我们与优秀的开发者和设计师合作，提供最优质的数字资源。
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">多类型支持</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    支持 Unity Assets、软件工具、设计素材、教育课程等多种资源类型，
                    满足不同项目和需求。
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">智能搜索</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    强大的搜索和筛选功能，帮助您快速找到所需资源。
                    支持多维度搜索和智能推荐。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">我们的团队</h2>
            <p className="text-lg text-gray-600 mb-8">
              ResLibs 由一群热爱技术和创意的开发者、设计师和产品经理组成。
              我们致力于为用户提供最优质的服务和体验。
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">技术团队</h3>
                <p className="text-gray-600">专注于平台技术架构和用户体验优化</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">设计团队</h3>
                <p className="text-gray-600">负责视觉设计和用户体验设计</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">运营团队</h3>
                <p className="text-gray-600">管理社区内容和用户服务</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            加入我们的社区
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            成为 ResLibs 的一员，与全球的开发者和设计师一起分享和创造
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/resources">开始探索</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/upload">分享资源</Link>
            </Button>
          </div>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white hover:text-blue-200 transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-white hover:text-blue-200 transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="text-white hover:text-blue-200 transition-colors">
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}