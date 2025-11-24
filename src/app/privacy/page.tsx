import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-6">返回首页</Button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              最后更新时间：2025年1月
            </p>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">1. 信息收集</h2>
              <p className="text-gray-700 mb-4">
                我们收集您主动提供的信息，包括但不限于注册信息、联系方式等。
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">2. 信息使用</h2>
              <p className="text-gray-700 mb-4">
                我们使用收集的信息来提供、维护和保护我们的服务。
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">3. 信息共享</h2>
              <p className="text-gray-700 mb-4">
                除法律要求外，我们不会与第三方共享您的个人信息。
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">4. Cookie 使用</h2>
              <p className="text-gray-700 mb-4">
                我们使用 Cookie 来改善用户体验和分析网站使用情况。
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">5. 联系我们</h2>
              <p className="text-gray-700 mb-4">
                如有任何隐私相关问题，请联系：privacy@reslibs.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}