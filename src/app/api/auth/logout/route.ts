import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // 从请求中获取token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any

      // 查找并删除会话
      await prisma.adminSession.deleteMany({
        where: {
          token,
          userId: decoded.userId
        }
      })

      // 记录活动日志
      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: 'logout',
          details: { logoutTime: new Date().toISOString() },
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        message: '退出登录成功'
      })

    } catch (jwtError) {
      // Token无效，但仍然尝试清理会话
      await prisma.adminSession.deleteMany({
        where: { token }
      })

      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('退出登录错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}