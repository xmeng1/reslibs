import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const status = searchParams.get('status') || 'published'
    const typeId = searchParams.get('type')
    const categoryId = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'latest'

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = { status }

    if (typeId) where.typeId = typeId
    if (categoryId) where.categoryId = categoryId
    if (tag) {
      where.tags = {
        some: {
          name: tag
        }
      }
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { keywords: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 构建排序条件
    let orderBy: any = { createdAt: 'desc' }

    switch (sort) {
      case 'popular':
        orderBy = { downloadCount: 'desc' }
        break
      case 'views':
        orderBy = { viewCount: 'desc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      case 'latest':
      default:
        orderBy = { publishedAt: 'desc' }
        break
    }

    // 获取资源列表
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
              slug: true,
              icon: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              color: true
            },
            orderBy: {
              weight: 'desc'
            }
          },
          downloadLinks: {
            where: { isActive: true },
            select: {
              id: true,
              provider: true,
              price: true,
              platform: true,
              quality: true
            },
            orderBy: { createdAt: 'asc' },
            take: 1 // 只获取第一个下载链接
          }
        }
      }),
      prisma.resource.count({ where })
    ])

    // 增加浏览量（异步，不阻塞响应）
    if (resources.length > 0) {
      prisma.resource.updateMany({
        where: {
          id: { in: resources.map(r => r.id) }
        },
        data: {
          viewCount: {
            increment: 1
          }
        }
      }).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      data: {
        resources,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        filters: {
          status,
          typeId,
          categoryId,
          tag,
          search,
          sort
        }
      }
    })

  } catch (error) {
    console.error('获取资源列表错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}