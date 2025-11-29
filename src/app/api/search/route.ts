import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          resources: [],
          total: 0
        }
      })
    }

    // 构建搜索条件
    const searchQuery = query.trim()
    const where = {
      status: 'published',
      OR: [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        { keywords: { contains: searchQuery } }
      ]
    }

    // 搜索资源
    const resources = await prisma.resource.findMany({
      where,
      take: limit,
      orderBy: [
        { downloadCount: 'desc' },
        { viewCount: 'desc' }
      ],
      include: {
        type: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          },
          orderBy: {
            tag: {
              weight: 'desc'
            }
          }
        }
      }
    })

    const total = await prisma.resource.count({ where })

    return NextResponse.json({
      success: true,
      data: {
        resources,
        total,
        query: searchQuery
      }
    })

  } catch (error) {
    console.error('搜索错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}