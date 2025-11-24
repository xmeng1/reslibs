import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-6">返回首页</Button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">使用条款</h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              最后更新时间：2025年1月
            </p>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">1. 服务条款</h2>
              <p className="text-gray-700 mb-4">
                使用 ResLibs 服务即表示您同意遵守这些条款和条件。
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">2. 用户责任</h2>
              <p className="text-gray-700 mb-4">
                用户对其上传和分享的内容负责，确保不违反任何法律法规。
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">3. 知识产权</h2>
              <p className="text-gray-700 mb-4">
                用户保留其上传内容的知识产权，但授予 ResLibs 使用权限。
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">4. 禁止行为</h2>
              <p className="text-gray-700 mb-4">
                禁止上传违法、有害、侵犯他人权利的内容。
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">5. 服务变更</h2>
              <p className="text-gray-700 mb-4">
                我们保留随时修改或终止服务的权利。
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}