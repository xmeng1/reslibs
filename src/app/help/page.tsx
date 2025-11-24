import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, Book, Users, MessageCircle, Mail } from 'lucide-react'

const helpCategories = [
  {
    title: '快速开始',
    description: '了解如何快速使用 ResLibs 平台',
    icon: HelpCircle,
    articles: [
      '如何注册账号',
      '如何下载资源',
      '如何上传资源',
      '账户设置'
    ]
  },
  {
    title: '资源管理',
    description: '学习如何管理和分享您的资源',
    icon: Book,
    articles: [
      '资源上传指南',
      '资源格式要求',
      '资源审核流程',
      '版本管理'
    ]
  },
  {
    title: '社区指南',
    description: '了解社区规则和最佳实践',
    icon: Users,
    articles: [
      '社区规范',
      '如何获得好评',
      '版权说明',
      '举报违规内容'
    ]
  }
]

const faqItems = [
  {
    question: '如何下载资源？',
    answer: '浏览资源列表，找到需要的资源后，点击资源详情页的"立即下载"按钮即可。'
  },
  {
    question: '上传资源需要审核吗？',
    answer: '是的，所有上传的资源都需要经过人工审核，确保内容质量和合规性。'
  },
  {
    question: '支持哪些资源格式？',
    answer: '我们支持多种资源格式，包括 Unity 包 (.unitypackage)、3D模型文件、设计素材等。'
  },
  {
    question: '如何获得更多下载权限？',
    answer: '通过完善个人资料、上传优质资源、积极参与社区活动等方式可以提升权限等级。'
  }
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">帮助中心</h1>
              <p className="text-gray-600 mt-1">找到您需要的答案和支持</p>
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 搜索框 */}
          <div className="mb-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索帮助文章..."
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  搜索
                </Button>
              </div>
            </div>
          </div>

          {/* 帮助分类 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {helpCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                      </div>
                    </div>
                    <p className="text-gray-600">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <div
                          key={articleIndex}
                          className="p-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          • {article}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 常见问题 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 快速链接 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 视频教程 */}
            <Card>
              <CardHeader>
                <CardTitle>视频教程</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">视频教程 1</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium">5分钟快速上手</div>
                      <div className="text-sm text-gray-600">了解基本功能和使用方法</div>
                    </div>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium">资源上传完整教程</div>
                      <div className="text-sm text-gray-600">从准备文件到发布上线</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 联系支持 */}
            <Card>
              <CardHeader>
                <CardTitle>需要更多帮助？</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">在线客服</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    工作日 9:00-18:00 在线，随时为您解答问题
                  </p>
                  <Button size="sm" className="w-full">
                    开始聊天
                  </Button>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">邮件支持</span>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    发送邮件至 support@reslibs.com
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    发送邮件
                  </Button>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">社区论坛</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    与其他用户交流经验和解决方案
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    访问论坛
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 热门标签 */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">热门话题</h2>
            <div className="flex flex-wrap gap-2">
              {[
                '新手入门',
                '资源下载',
                '上传教程',
                '账户问题',
                '支付相关',
                '版权问题',
                '技术支持',
                '功能建议'
              ].map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-gray-100">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}