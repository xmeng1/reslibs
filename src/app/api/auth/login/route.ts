import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    // 生成随机的session token
    const sessionToken = randomBytes(32).toString('hex')

    // 生成JWT token用于API响应
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        sessionToken
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    // 更新登录信息
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: user.loginCount + 1
      }
    })

    // 清理该用户的旧会话记录，避免token唯一约束冲突
    await prisma.adminSession.deleteMany({
      where: {
        userId: user.id
      }
    })

    // 创建会话记录
    await prisma.adminSession.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'login',
        details: JSON.stringify({ loginTime: new Date().toISOString() }),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        },
        token: jwtToken
      }
    })

  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}