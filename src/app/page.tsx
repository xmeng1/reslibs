import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            ResLibs
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            通用资源分享平台 - 支持 Unity Assets、软件工具、设计素材等多种资源类型
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/resources"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
            >
              浏览资源
            </Link>
            <Link
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
            >
              管理后台
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">多类型支持</h3>
            <p className="text-gray-600">
              支持 Unity Assets、软件工具、设计素材、教育课程等多种资源类型
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">自动化处理</h3>
            <p className="text-gray-600">
              AI 驱动的内容生成，自动化的资源处理和分发流程
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">快速部署</h3>
            <p className="text-gray-600">
              基于 Next.js 的现代化架构，支持快速开发和部署
            </p>
          </div>
        </div>
      </div>

      {/* Resource Types Preview */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">支持的资源类型</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Unity Assets', icon: '🎮', color: 'bg-purple-100 text-purple-800' },
            { name: '软件工具', icon: '⚙️', color: 'bg-blue-100 text-blue-800' },
            { name: '设计素材', icon: '🎨', color: 'bg-green-100 text-green-800' },
            { name: '视频课程', icon: '📹', color: 'bg-red-100 text-red-800' },
          ].map((type) => (
            <div key={type.name} className={`${type.color} p-4 rounded-lg text-center`}>
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="font-semibold">{type.name}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}