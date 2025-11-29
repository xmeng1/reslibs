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

    const resourceTypes = await prisma.resourceType.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            resources: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { resourceTypes }
    })

  } catch (error) {
    console.error('获取资源类型错误:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}