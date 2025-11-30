'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AdminProtected from '@/components/AdminProtected'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  color: string
}

const RESOURCE_TYPES = [
  { value: 'unity-assets', label: 'Unity Assets', icon: '🎮' },
  { value: 'software', label: '软件工具', icon: '⚙️' },
  { value: 'design', label: '设计素材', icon: '🎨' },
  { value: 'video', label: '视频课程', icon: '📹' }
]

export default function NewResource() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'unity-assets',
    categoryId: '',
    version: '',
    downloadUrl: '',
    previewImage: '',
    fileSize: 0,
    status: 'draft'
  })

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [token])

  const fetchCategories = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.data.categories || [])
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchTags = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/tags', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTags(data.data.tags || [])
      }
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) return

    // 验证必填字段
    if (!formData.title.trim()) {
      alert('请输入资源标题')
      return
    }

    if (!formData.categoryId) {
      alert('请选择资源分类')
      return
    }

    try {
      setIsLoading(true)

      const payload = {
        ...formData,
        tags: selectedTags,
        fileSize: formData.fileSize || 0
      }

      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        alert('资源创建成功')
        router.push('/admin/resources')
      } else {
        const error = await response.json()
        alert(error.message || '创建失败，请重试')
      }
    } catch (error) {
      console.error('创建资源错误:', error)
      alert('创建失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTag = () => {
    if (newTagName.trim() && !selectedTags.includes(newTagName.trim())) {
      setSelectedTags([...selectedTags, newTagName.trim()])
      setNewTagName('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleSelectExistingTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName])
    }
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航栏 */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin/resources" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">创建新资源</h1>
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
                  <span>{isLoading ? '创建中...' : '创建资源'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 基本信息 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      资源标题 *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入资源标题"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      版本号
                    </label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="如：1.0.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    资源描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入资源描述"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      资源类型 *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {RESOURCE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类 *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">选择分类</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* 标签管理 */}
            <Card>
              <CardHeader>
                <CardTitle>标签管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 现有标签 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    现有标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleSelectExistingTag(tag.name)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          selectedTags.includes(tag.name)
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: selectedTags.includes(tag.name) ? undefined : tag.color + '20'
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 添加新标签 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    添加新标签
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="输入标签名"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 已选标签 */}
                {selectedTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      已选标签
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <div
                          key={tag}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 下载信息 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>下载信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    下载链接
                  </label>
                  <Input
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                    placeholder="https://example.com/download/file.zip"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      预览图片
                    </label>
                    <Input
                      value={formData.previewImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, previewImage: e.target.value }))}
                      placeholder="https://example.com/preview.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      文件大小 (MB)
                    </label>
                    <Input
                      type="number"
                      value={formData.fileSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, fileSize: parseFloat(e.target.value) || 0 }))}
                      placeholder="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </AdminProtected>
  )
}