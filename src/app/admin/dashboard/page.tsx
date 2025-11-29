'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AdminProtected from '@/components/AdminProtected'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Users,
  Settings,
  Upload,
  Download,
  TrendingUp,
  LogOut,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react'

interface DashboardStats {
  totalResources: number
  totalDownloads: number
  totalViews: number
  publishedResources: number
  draftResources: number
}

interface RecentActivity {
  id: string
  action: string
  resourceTitle: string
  timestamp: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalResources: 0,
    totalDownloads: 0,
    totalViews: 0,
    publishedResources: 0,
    draftResources: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 这里应该调用真实的API来获取统计数据
      // 现在使用模拟数据
      setTimeout(() => {
        setStats({
          totalResources: 156,
          totalDownloads: 45678,
          totalViews: 123456,
          publishedResources: 134,
          draftResources: 22
        })

        setRecentActivities([
          {
            id: '1',
            action: '创建',
            resourceTitle: 'Unity 3D 角色模型包',
            timestamp: '2 分钟前'
          },
          {
            id: '2',
            action: '更新',
            resourceTitle: 'Blender 建模教程',
            timestamp: '15 分钟前'
          },
          {
            id: '3',
            action: '发布',
            resourceTitle: 'UI 设计系统组件库',
            timestamp: '1 小时前'
          },
          {
            id: '4',
            action: '删除',
            resourceTitle: '过时的软件工具',
            timestamp: '2 小时前'
          }
        ])

        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: '总资源数',
      value: stats.totalResources.toString(),
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: '已发布',
      value: stats.publishedResources.toString(),
      change: '+8%',
      icon: Upload,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: '总下载量',
      value: stats.totalDownloads.toLocaleString(),
      change: '+23%',
      icon: Download,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: '总浏览量',
      value: stats.totalViews.toLocaleString(),
      change: '+15%',
      icon: BarChart3,
      color: 'text-orange-600 bg-orange-50'
    }
  ]

  if (isLoading) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载仪表板数据...</p>
          </div>
        </div>
      </AdminProtected>
    )
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航栏 */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin/dashboard" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">ResLibs Admin</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-600 text-sm font-medium">
                      {(user?.name || user?.username)?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="container mx-auto px-4 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">仪表板</h1>
            <p className="text-gray-600 mt-1">欢迎回来，{user?.name || user?.username}！</p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 快速操作 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>快速操作</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/resources">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium">资源管理</div>
                          <div className="text-sm text-gray-500">管理所有资源</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/admin/resources/new">
                    <Button className="w-full justify-start h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <Plus className="w-5 h-5 text-white" />
                        <div className="text-left">
                          <div className="font-medium">添加资源</div>
                          <div className="text-sm text-blue-100">创建新资源</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/admin/categories">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                          <div className="font-medium">分类管理</div>
                          <div className="text-sm text-gray-500">管理资源分类</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/admin/activity">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <div className="text-left">
                          <div className="font-medium">活动日志</div>
                          <div className="text-sm text-gray-500">查看操作记录</div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 最近活动 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>最近活动</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action} - {activity.resourceTitle}
                        </p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Link href="/admin/activity">
                    <Button variant="outline" size="sm" className="w-full">
                      查看所有活动
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 待处理项目 */}
          {stats.draftResources > 0 && (
            <Card className="mt-8 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-800">
                  <Settings className="w-5 h-5" />
                  <span>待处理项目</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700 mb-4">
                  当前有 {stats.draftResources} 个草稿资源待发布
                </p>
                <Link href="/admin/resources?status=draft">
                  <Button variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                    查看草稿
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminProtected>
  )
}