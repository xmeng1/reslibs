'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  language: string
  theme: 'light' | 'dark' | 'system'
  privacy: {
    showEmail: boolean
    showDownloads: boolean
    allowMessages: boolean
  }
  security: {
    twoFactorEnabled: boolean
    loginAlerts: boolean
  }
}

export default function Settings() {
  const { user, token } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: false,
    language: 'zh-CN',
    theme: 'system',
    privacy: {
      showEmail: false,
      showDownloads: true,
      allowMessages: true
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [token])

  const fetchSettings = async () => {
    if (!token || !user) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/user/settings', {
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
      const response = await fetch('/api/user/settings', {
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

  const handlePasswordChange = async () => {
    if (!token) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新密码和确认密码不匹配')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      alert('新密码长度至少为6位')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        alert('密码修改成功')
        setShowPasswordForm(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        alert(error.message || '密码修改失败，请重试')
      }
    } catch (error) {
      console.error('修改密码错误:', error)
      alert('密码修改失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载设置...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">用户设置</h1>
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

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 通知设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>通知设置</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">邮件通知</p>
                  <p className="text-sm text-gray-500">接收系统邮件通知</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">推送通知</p>
                  <p className="text-sm text-gray-500">接收浏览器推送通知</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 外观设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>外观设置</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题模式
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">浅色模式</option>
                  <option value="dark">深色模式</option>
                  <option value="system">跟随系统</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  语言设置
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* 隐私设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>隐私设置</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">显示邮箱</p>
                  <p className="text-sm text-gray-500">在个人资料中显示邮箱</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, showEmail: !prev.privacy.showEmail }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.showEmail ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">显示下载记录</p>
                  <p className="text-sm text-gray-500">公开显示下载历史</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, showDownloads: !prev.privacy.showDownloads }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.showDownloads ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.showDownloads ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">允许消息</p>
                  <p className="text-sm text-gray-500">允许其他用户发送消息</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, allowMessages: !prev.privacy.allowMessages }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.allowMessages ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.allowMessages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 安全设置 */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>安全设置</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">双重认证</p>
                      <p className="text-sm text-gray-500">增强账户安全性</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">登录提醒</p>
                      <p className="text-sm text-gray-500">异常登录时发送邮件提醒</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, loginAlerts: !prev.security.loginAlerts }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.loginAlerts ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {!showPasswordForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(true)}
                      className="w-full"
                    >
                      修改密码
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          当前密码
                        </label>
                        <Input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({
                            ...prev,
                            currentPassword: e.target.value
                          }))}
                          placeholder="输入当前密码"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          新密码
                        </label>
                        <Input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({
                            ...prev,
                            newPassword: e.target.value
                          }))}
                          placeholder="输入新密码（至少6位）"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          确认新密码
                        </label>
                        <Input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))}
                          placeholder="再次输入新密码"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={handlePasswordChange}
                          disabled={isSaving}
                          className="flex-1"
                        >
                          {isSaving ? '修改中...' : '确认修改'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false)
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            })
                          }}
                          className="flex-1"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}