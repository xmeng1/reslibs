import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// 认证中间件
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('未提供认证令牌')
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any

    // 从JWT中提取sessionToken
    const sessionToken = decoded.sessionToken

    if (!sessionToken) {
      throw new Error('无效的认证令牌格式')
    }

    // 检查会话是否有效
    const session = await prisma.adminSession.findFirst({
      where: {
        token: sessionToken,
        userId: decoded.userId,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!session) {
      throw new Error('会话已过期或无效')
    }

    return decoded
  } catch (error) {
    throw new Error('无效的认证令牌')
  }
}

export async function GET(request: NextRequest) {
  try {
    await authenticate(request)

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            resources: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { categories }
    })

  } catch (error) {
    console.error('获取分类错误:', error)

    // 认证错误返回401
    if (error instanceof Error && (
      error.message.includes('未提供认证令牌') ||
      error.message.includes('会话已过期') ||
      error.message.includes('无效的认证令牌')
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // 其他错误返回500
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}