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
  Folder,
  Tag,
  Settings
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  resourceCount: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export default function AdminCategories() {
  const { user, token } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [token])

  const fetchCategories = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.data.categories || [])
      } else {
        console.error('获取分类失败')
      }
    } catch (error) {
      console.error('获取分类错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('确定要删除这个分类吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchCategories()
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除分类错误:', error)
      alert('删除失败，请重试')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">活跃</Badge>
      case 'inactive':
        return <Badge variant="secondary">未激活</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading && categories.length === 0) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载分类列表...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/admin/categories/new">
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>添加分类</span>
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
                      placeholder="搜索分类名称或描述..."
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
                    <option value="active">活跃</option>
                    <option value="inactive">未激活</option>
                  </select>
                  <Button variant="outline" onClick={fetchCategories}>
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Folder className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                    <p className="text-sm text-gray-600">总分类数</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Tag className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {categories.reduce((sum, c) => sum + c.resourceCount, 0)}
                    </p>
                    <p className="text-sm text-gray-600">关联资源数</p>
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
                      {categories.filter(c => c.status === 'active').length}
                    </p>
                    <p className="text-sm text-gray-600">活跃分类</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 分类列表 */}
          <Card>
            <CardHeader>
              <CardTitle>分类列表</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">暂无分类</p>
                  <Link href="/admin/categories/new">
                    <Button>创建第一个分类</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">分类名称</th>
                        <th className="text-left py-3 px-4">标识符</th>
                        <th className="text-left py-3 px-4">描述</th>
                        <th className="text-left py-3 px-4">状态</th>
                        <th className="text-left py-3 px-4">资源数量</th>
                        <th className="text-left py-3 px-4">创建时间</th>
                        <th className="text-right py-3 px-4">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {category.icon && <span>{category.icon}</span>}
                              <span className="font-medium text-gray-900">{category.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {category.slug}
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-600 max-w-xs truncate">
                              {category.description || '-'}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(category.status)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{category.resourceCount}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              <p>{new Date(category.createdAt).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Link href={`/admin/categories/${category.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(category.id)}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminProtected>
  )
}