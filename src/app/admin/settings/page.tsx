'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AdminProtected from '@/components/AdminProtected'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Save,
  Settings as SettingsIcon,
  Globe,
  Mail,
  Shield,
  Database
} from 'lucide-react'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  maxFileSize: number
  allowedFileTypes: string[]
  enableRegistration: boolean
  enableEmailVerification: boolean
  maintenanceMode: boolean
}

export default function AdminSettings() {
  const { user, token } = useAuth()
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'ResLibs',
    siteDescription: '通用资源分享平台',
    siteUrl: 'https://reslibs.com',
    adminEmail: 'admin@reslibs.com',
    maxFileSize: 100,
    allowedFileTypes: ['.zip', '.rar', '.7z', '.unitypackage', '.blend', '.psd', '.ai', '.mp4'],
    enableRegistration: true,
    enableEmailVerification: true,
    maintenanceMode: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [token])

  const fetchSettings = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data.settings) {
          setSettings(data.data.settings)
        }
      } else {
        console.error('获取设置失败')
      }
    } catch (error) {
      console.error('获取设置错误:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!token) return

    try {
      setIsSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        alert('设置保存成功')
      } else {
        alert('设置保存失败，请重试')
      }
    } catch (error) {
      console.error('保存设置错误:', error)
      alert('设置保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载设置...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? '保存中...' : '保存设置'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 基本设置 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>基本设置</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    网站名称
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="输入网站名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    网站描述
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    placeholder="输入网站描述"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    网站URL
                  </label>
                  <Input
                    value={settings.siteUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                    placeholder="https://reslibs.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    管理员邮箱
                  </label>
                  <Input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="admin@reslibs.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 系统状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>系统状态</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">维护模式</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">开放注册</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enableRegistration: !prev.enableRegistration }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableRegistration ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableRegistration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">邮箱验证</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enableEmailVerification: !prev.enableEmailVerification }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableEmailVerification ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableEmailVerification ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 上传设置 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>上传设置</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大文件大小 (MB)
                  </label>
                  <Input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) || 0 }))}
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    允许的文件类型
                  </label>
                  <Input
                    value={settings.allowedFileTypes.join(', ')}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      allowedFileTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder=".zip, .rar, .7z, .unitypackage"
                  />
                  <p className="text-sm text-gray-500 mt-1">用逗号分隔文件扩展名</p>
                </div>
              </CardContent>
            </Card>

            {/* 邮件设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>邮件设置</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">邮件配置功能即将推出</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminProtected>
  )
}