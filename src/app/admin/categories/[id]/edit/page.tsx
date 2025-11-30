'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AdminProtected from '@/components/AdminProtected'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export default function EditCategory() {
  const { user, token } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [category, setCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    status: 'active' as 'active' | 'inactive'
  })

  useEffect(() => {
    if (params.id) {
      fetchCategory()
    }
  }, [params.id, token])

  const fetchCategory = async () => {
    if (!token || !params.id) return

    try {
      setIsFetching(true)
      const response = await fetch(`/api/admin/categories/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const categoryData = data.data.category
        setCategory(categoryData)
        setFormData({
          name: categoryData.name || '',
          slug: categoryData.slug || '',
          description: categoryData.description || '',
          icon: categoryData.icon || '',
          color: categoryData.color || '#3B82F6',
          status: categoryData.status || 'active'
        })
      } else {
        alert('获取分类信息失败')
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('获取分类信息错误:', error)
      alert('获取分类信息失败')
      router.push('/admin/categories')
    } finally {
      setIsFetching(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !params.id) return

    // 验证必填字段
    if (!formData.name.trim()) {
      alert('请输入分类名称')
      return
    }

    if (!formData.slug.trim()) {
      alert('请输入分类标识符')
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/admin/categories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        alert('分类更新成功')
        router.push('/admin/categories')
      } else {
        const error = await response.json()
        alert(error.message || '更新失败，请重试')
      }
    } catch (error) {
      console.error('更新分类错误:', error)
      alert('更新失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载分类信息...</p>
          </div>
        </div>
      </AdminProtected>
    )
  }

  if (!category) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">分类不存在</p>
            <Link href="/admin/categories">
              <Button className="mt-4">返回分类列表</Button>
            </Link>
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
                <Link href="/admin/categories" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">编辑分类</h1>
                <span className="text-sm text-gray-500">ID: {category.id}</span>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? '更新中...' : '保存更改'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 基本信息 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类名称 *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="输入分类名称"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标识符 *
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="category-slug"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      用于URL的唯一标识符，只能包含字母、数字、中文和连字符
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="输入分类描述"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        图标
                      </label>
                      <Input
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="🎮 或图标类名"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        可以使用emoji或图标库的类名
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        颜色
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-16 h-10"
                        />
                        <Input
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      状态
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">活跃</option>
                      <option value="inactive">未激活</option>
                    </select>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 预览 */}
            <Card>
              <CardHeader>
                <CardTitle>预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">分类卡片预览</p>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        {formData.icon && <span className="text-2xl">{formData.icon}</span>}
                        <h3 className="font-semibold text-lg">{formData.name || '分类名称'}</h3>
                      </div>
                      {formData.description && (
                        <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: formData.color }}
                        >
                          {formData.status === 'active' ? '活跃' : '未激活'}
                        </span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {formData.slug || 'category-slug'}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">统计信息</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">创建时间</span>
                        <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">更新时间</span>
                        <span>{new Date(category.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminProtected>
  )
}