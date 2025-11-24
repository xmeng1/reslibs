import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Users,
  Settings,
  BarChart3,
  Upload,
  Download,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

// 模拟统计数据
const stats = [
  {
    title: '总资源数',
    value: '5,234',
    change: '+12%',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    title: '用户总数',
    value: '10,456',
    change: '+8%',
    icon: Users,
    color: 'text-green-600'
  },
  {
    title: '今日下载',
    value: '1,892',
    change: '+23%',
    icon: Download,
    color: 'text-purple-600'
  },
  {
    title: '本月上传',
    value: '342',
    change: '+15%',
    icon: Upload,
    color: 'text-orange-600'
  }
]

// 模拟最近活动
const recentActivities = [
  {
    id: 1,
    type: 'upload',
    user: '张三',
    resource: 'Unity 3D 角色模型包',
    time: '2 分钟前',
    status: 'pending'
  },
  {
    id: 2,
    type: 'download',
    user: '李四',
    resource: 'Blender 建模教程',
    time: '15 分钟前',
    status: 'completed'
  },
  {
    id: 3,
    type: 'comment',
    user: '王五',
    resource: 'UI 设计系统',
    time: '1 小时前',
    status: 'completed'
  }
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
              <p className="text-gray-600 mt-1">管理系统资源和用户</p>
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                    <Badge variant="secondary" className="text-green-600">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.title}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                资源管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">管理系统中的所有资源</p>
              <Button className="w-full">进入管理</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                用户管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">管理平台用户和权限</p>
              <Button className="w-full">进入管理</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                数据统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">查看平台运营数据</p>
              <Button className="w-full">查看统计</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                系统设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">配置系统参数和功能</p>
              <Button className="w-full">进入设置</Button>
            </CardContent>
          </Card>
        </div>

        {/* 最近活动 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {activity.user}
                      </div>
                      <div className="text-sm text-gray-600">
                        {activity.resource}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">
                        {activity.time}
                      </div>
                      <Badge
                        variant={activity.status === 'pending' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {activity.status === 'pending' ? '待处理' : '已完成'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                系统提醒
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">待审核资源</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    当前有 12 个资源待审核，请及时处理。
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    立即处理
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">数据更新</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    本周平台活跃度增长 23%，表现优秀！
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800">新增用户</span>
                  </div>
                  <p className="text-sm text-green-700">
                    今日新增用户 156 人，欢迎新用户加入！
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}