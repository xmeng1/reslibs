import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-6">返回首页</Button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">联系我们</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 联系表单 */}
            <Card>
              <CardHeader>
                <CardTitle>发送消息</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="您的姓名" />
                    <Input type="email" placeholder="邮箱地址" />
                  </div>
                  <Input placeholder="主题" />
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                    placeholder="请输入您的消息..."
                  ></textarea>
                  <Button className="w-full">发送消息</Button>
                </form>
              </CardContent>
            </Card>

            {/* 联系信息 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>联系方式</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span>support@reslibs.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span>+86 400-123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span>北京市朝阳区XXX街道XXX号</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    在线客服
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    工作日 9:00-18:00 在线，随时为您解答问题
                  </p>
                  <Button className="w-full">开始聊天</Button>
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