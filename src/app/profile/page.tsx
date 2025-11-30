'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Calendar,
  Download,
  Upload,
  Settings,
  Edit,
  Save
} from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'banned'
  resourceCount: number
  downloadCount: number
  createdAt: string
  lastLoginAt?: string
}

export default function Profile() {
  const { user, token } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [token])

  const fetchProfile = async () => {
    if (!token || !user) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.data.user)
        setEditForm({
          username: data.data.user.username,
          email: data.data.user.email
        })
      } else {
        console.error('获取用户资料失败')
      }
    } catch (error) {
      console.error('获取用户资料错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!token) return

    try {
      setIsSaving(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        alert('资料更新成功')
        setIsEditing(false)
        fetchProfile()
      } else {
        alert('资料更新失败，请重试')
      }
    } catch (error) {
      console.error('更新资料错误:', error)
      alert('资料更新失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        username: profile.username,
        email: profile.email
      })
    }
    setIsEditing(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">管理员</Badge>
      case 'user':
        return <Badge variant="secondary">普通用户</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">活跃</Badge>
      case 'inactive':
        return <Badge variant="secondary">未激活</Badge>
      case 'banned':
        return <Badge className="bg-red-100 text-red-800">已封禁</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载用户资料...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">无法加载用户资料</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 用户基本信息 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>基本信息</span>
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>编辑</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? '保存中...' : '保存'}</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="输入用户名"
                  />
                ) : (
                  <p className="text-gray-900">{profile.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="输入邮箱地址"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                {getRoleBadge(profile.role)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  状态
                </label>
                {getStatusBadge(profile.status)}
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>统计信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">上传资源</span>
                </div>
                <Badge variant="outline">{profile.resourceCount}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">下载次数</span>
                </div>
                <Badge variant="outline">{profile.downloadCount}</Badge>
              </div>

              <hr />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  注册时间
                </label>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {profile.lastLoginAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最后登录
                  </label>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(profile.lastLoginAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-auto p-4"
                  onClick={() => window.location.href = '/my-resources'}
                >
                  <Upload className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-medium">我的资源</p>
                    <p className="text-sm text-gray-500">管理上传的资源</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-auto p-4"
                  onClick={() => window.location.href = '/upload'}
                >
                  <Upload className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-medium">上传资源</p>
                    <p className="text-sm text-gray-500">分享新的资源</p>
                  </div>
                </Button>

                {profile.role === 'admin' && (
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 h-auto p-4"
                    onClick={() => window.location.href = '/admin/dashboard'}
                  >
                    <Settings className="w-6 h-6" />
                    <div className="text-left">
                      <p className="font-medium">管理后台</p>
                      <p className="text-sm text-gray-500">系统管理</p>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}