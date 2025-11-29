'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AdminProtected from '@/components/AdminProtected'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Download,
  FileText,
  Settings
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  slug: string
  status: string
  type: {
    displayName: string
    icon: string
  }
  category: {
    name: string
  }
  tags: Array<{
    id: string
    name: string
    color: string
  }>
  downloadCount: number
  viewCount: number
  createdAt: string
  publishedAt?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminResources() {
  const { user, token } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchResources()
  }, [token, pagination.page, filterStatus])

  const fetchResources = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (filterStatus) {
        params.append('status', filterStatus)
      }

      const response = await fetch(`/api/admin/resources?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResources(data.data.resources)
        setPagination(data.data.pagination)
      } else {
        console.error('获取资源失败')
      }
    } catch (error) {
      console.error('获取资源错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (resourceId: string) => {
    if (!confirm('确定要删除这个资源吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchResources()
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除资源错误:', error)
      alert('删除失败，请重试')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">已发布</Badge>
      case 'draft':
        return <Badge variant="secondary">草稿</Badge>
      case 'archived':
        return <Badge variant="outline">已归档</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading && resources.length === 0) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载资源列表...</p>
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
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                  ← 返回仪表板
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">资源管理</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/admin/resources/new">
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>添加资源</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="container mx-auto px-4 py-8">
          {/* 搜索和筛选 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索资源标题或描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">所有状态</option>
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                    <option value="archived">已归档</option>
                  </select>
                  <Button variant="outline" onClick={fetchResources}>
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                    <p className="text-sm text-gray-600">总资源数</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Eye className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {resources.reduce((sum, r) => sum + r.viewCount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">总浏览量</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Download className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {resources.reduce((sum, r) => sum + r.downloadCount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">总下载量</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Settings className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {resources.filter(r => r.status === 'published').length}
                    </p>
                    <p className="text-sm text-gray-600">已发布</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 资源列表 */}
          <Card>
            <CardHeader>
              <CardTitle>资源列表</CardTitle>
            </CardHeader>
            <CardContent>
              {resources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">暂无资源</p>
                  <Link href="/admin/resources/new">
                    <Button>创建第一个资源</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">资源</th>
                        <th className="text-left py-3 px-4">类型</th>
                        <th className="text-left py-3 px-4">分类</th>
                        <th className="text-left py-3 px-4">状态</th>
                        <th className="text-left py-3 px-4">统计</th>
                        <th className="text-left py-3 px-4">创建时间</th>
                        <th className="text-right py-3 px-4">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((resource) => (
                        <tr key={resource.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{resource.title}</p>
                              <p className="text-sm text-gray-500">/{resource.slug}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span>{resource.type.icon}</span>
                              <span className="text-sm">{resource.type.displayName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{resource.category.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(resource.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              <p>👁 {resource.viewCount}</p>
                              <p>⬇ {resource.downloadCount}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              <p>{new Date(resource.createdAt).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Link href={`/admin/resources/${resource.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(resource.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 分页 */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                      <div className="text-sm text-gray-600">
                        显示 {((pagination.page - 1) * pagination.limit) + 1} 到{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                        共 {pagination.total} 条
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!pagination.hasPrev}
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                          上一页
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!pagination.hasNext}
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                          下一页
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminProtected>
  )
}