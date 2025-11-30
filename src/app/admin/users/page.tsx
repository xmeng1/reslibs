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
  Search,
  Filter,
  Users,
  User,
  Shield,
  Ban,
  CheckCircle,
  Settings
} from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'banned'
  resourceCount: number
  downloadCount: number
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export default function AdminUsers() {
  const { user, token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [token])

  const fetchUsers = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.users || [])
      } else {
        console.error('获取用户失败')
      }
    } catch (error) {
      console.error('获取用户错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert('状态更新失败，请重试')
      }
    } catch (error) {
      console.error('更新用户状态错误:', error)
      alert('状态更新失败，请重试')
    }
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

  if (isLoading && users.length === 0) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载用户列表...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
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
                      placeholder="搜索用户名或邮箱..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">所有角色</option>
                    <option value="admin">管理员</option>
                    <option value="user">普通用户</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">所有状态</option>
                    <option value="active">活跃</option>
                    <option value="inactive">未激活</option>
                    <option value="banned">已封禁</option>
                  </select>
                  <Button variant="outline" onClick={fetchUsers}>
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
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    <p className="text-sm text-gray-600">总用户数</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <User className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.status === 'active').length}
                    </p>
                    <p className="text-sm text-gray-600">活跃用户</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                    <p className="text-sm text-gray-600">管理员</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Ban className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.status === 'banned').length}
                    </p>
                    <p className="text-sm text-gray-600">已封禁</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 用户列表 */}
          <Card>
            <CardHeader>
              <CardTitle>用户列表</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无用户</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">用户信息</th>
                        <th className="text-left py-3 px-4">角色</th>
                        <th className="text-left py-3 px-4">状态</th>
                        <th className="text-left py-3 px-4">资源统计</th>
                        <th className="text-left py-3 px-4">最后登录</th>
                        <th className="text-left py-3 px-4">注册时间</th>
                        <th className="text-right py-3 px-4">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{userItem.username}</p>
                              <p className="text-sm text-gray-500">{userItem.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getRoleBadge(userItem.role)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(userItem.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              <p>📁 {userItem.resourceCount} 资源</p>
                              <p>⬇ {userItem.downloadCount} 下载</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {userItem.lastLoginAt
                                ? new Date(userItem.lastLoginAt).toLocaleDateString()
                                : '从未登录'
                              }
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              <p>{new Date(userItem.createdAt).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              {userItem.status === 'active' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(userItem.id, 'banned')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(userItem.id, 'active')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
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