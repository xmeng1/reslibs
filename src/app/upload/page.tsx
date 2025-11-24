'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Image, Video, Code, Music } from 'lucide-react'
import { RESOURCE_TYPES } from '@/types/resource'

export default function UploadPage() {
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    tags: string;
    file: File | null;
  }>({
    title: '',
    description: '',
    category: '',
    tags: '',
    file: null
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 这里处理文件上传逻辑
    console.log('上传资源:', formData)
    alert('资源上传成功！（这里是演示）')
  }

  const getIconForResourceType = (typeId: string) => {
    const type = RESOURCE_TYPES.find(t => t.id === typeId)
    return type?.icon || '📦'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">上传资源</h1>
              <p className="text-gray-600 mt-1">分享您的优质资源</p>
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 资源类型选择 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">选择资源类型</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {RESOURCE_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all ${
                    selectedType === type.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-medium">{type.displayName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 上传表单 */}
          {selectedType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getIconForResourceType(selectedType)}</span>
                  上传 {RESOURCE_TYPES.find(t => t.id === selectedType)?.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 文件上传 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择文件
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        拖拽文件到这里或点击选择
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        支持 {RESOURCE_TYPES.find(t => t.id === selectedType)?.fileExtensions.join(', ')} 格式
                      </div>
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        className="max-w-xs mx-auto"
                        accept={RESOURCE_TYPES.find(t => t.id === selectedType)?.fileExtensions.join(',')}
                      />
                    </div>
                    {formData.file && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{formData.file.name}</span>
                          <span className="text-sm">({(formData.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 基本信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        资源标题 *
                      </label>
                      <Input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="输入资源标题"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分类 *
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        required
                      >
                        <option value="">选择分类</option>
                        <option value="tools">开发工具</option>
                        <option value="assets">素材资源</option>
                        <option value="templates">模板</option>
                        <option value="tutorials">教程</option>
                      </select>
                    </div>
                  </div>

                  {/* 描述 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      详细描述 *
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="详细描述您的资源，包括功能、使用方法等"
                      required
                    ></textarea>
                  </div>

                  {/* 标签 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      标签
                    </label>
                    <Input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="输入标签，用逗号分隔（如：3D模型，Unity，游戏开发）"
                    />
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 mb-2">推荐标签：</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                          3D模型
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                          Unity
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                          游戏开发
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                          开发工具
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                          设计素材
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      提交审核
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setSelectedType('')
                      setFormData({
                        title: '',
                        description: '',
                        category: '',
                        tags: '',
                        file: null
                      })
                    }}>
                      重置
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 上传须知 */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">上传须知</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• 请确保您拥有资源的版权或授权</li>
              <li>• 资源必须具有实用性和高质量</li>
              <li>• 请提供准确的描述和适当的标签</li>
              <li>• 所有资源将经过人工审核，审核通过后才会发布</li>
              <li>• 请遵守相关法律法规和平台规定</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}