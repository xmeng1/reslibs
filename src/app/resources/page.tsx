'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, Download, Eye, Loader2 } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

interface Resource {
  id: string
  title: string
  description: string
  thumbnail: string
  status: string
  downloadCount: number
  viewCount: number
  createdAt: string
  type: {
    id: string
    name: string
    displayName: string
    icon: string
  }
  category: {
    id: string
    name: string
    icon: string
  }
  tags: Array<{
    tag: {
      id: string
      name: string
      color: string
    }
  }>
  downloadLinks: Array<{
    id: string
    provider: string
    price: string
    platform: string
    quality: string
  }>
}

interface ResourcesResponse {
  success: boolean
  data: {
    resources: Resource[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
    filters: {
      status: string
      typeId: string | null
      categoryId: string | null
      tag: string | null
      search: string | null
      sort: string
    }
  }
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy
      })

      if (search.trim()) {
        params.append('search', search.trim())
      }

      if (typeFilter) {
        params.append('type', typeFilter)
      }

      const response = await fetch(`/api/resources?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ResourcesResponse = await response.json()

      if (data.success) {
        setResources(data.data.resources)
        setPagination(data.data.pagination)
      } else {
        throw new Error('API returned unsuccessful response')
      }
    } catch (err) {
      console.error('Error fetching resources:', err)
      setError('加载资源失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [currentPage, sortBy, typeFilter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchResources()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleTypeFilterChange = (newType: string) => {
    setTypeFilter(newType)
    setCurrentPage(1)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading && resources.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载资源中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">资源库</h1>
              <p className="text-gray-600 mt-1">发现和下载优质的各类资源</p>
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 搜索和筛选区域 */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="搜索资源..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* 资源类型筛选 */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                className="border rounded-md px-3 py-2 bg-white"
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
              >
                <option value="">所有类型</option>
                <option value="unity-assets">🎮 Unity Assets</option>
                <option value="software-tools">⚙️ 软件工具</option>
                <option value="design-assets">🎨 设计素材</option>
                <option value="video-courses">📹 视频课程</option>
                <option value="audio-music">🎵 音频音乐</option>
                <option value="documentation">📚 文档资料</option>
              </select>
            </div>

            {/* 排序选项 */}
            <select
              className="border rounded-md px-3 py-2 bg-white"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="latest">最新发布</option>
              <option value="popular">最多下载</option>
              <option value="views">最多浏览</option>
              <option value="title">按名称</option>
            </select>

            <Button onClick={handleSearch}>
              搜索
            </Button>
          </div>
        </div>

        {/* 错误状态 */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchResources}
            >
              重试
            </Button>
          </div>
        )}

        {/* 资源网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {resource.type.icon} {resource.type.displayName}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {resource.category.icon} {resource.category.name}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                  <Link href={`/resources/${resource.id}`}>
                    {resource.title}
                  </Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map((tagItem) => (
                    <Badge
                      key={tagItem.tag.id}
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: tagItem.tag.color }}
                    >
                      {tagItem.tag.name}
                    </Badge>
                  ))}
                  {resource.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{resource.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{resource.downloadCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{resource.viewCount.toLocaleString()}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    查看详情
                  </Button>
                  {resource.downloadLinks.length > 0 && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={resource.downloadLinks[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        下载
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态 */}
        {!loading && resources.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无资源</h3>
            <p className="text-gray-500">
              当前没有符合筛选条件的资源，请尝试调整筛选条件。
            </p>
          </div>
        )}

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev || loading}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                上一页
              </Button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  disabled={loading}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                disabled={!pagination.hasNext || loading}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}