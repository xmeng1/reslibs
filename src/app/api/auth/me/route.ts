import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
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

      // 查找用户信息
      const user = await prisma.adminUser.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          loginCount: true,
          createdAt: true
        }
      })

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: '用户不存在或已被禁用' },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { user }
      })

    } catch (jwtError) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('获取用户信息错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}