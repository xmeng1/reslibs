import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

// 资源创建验证模式
const resourceSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  slug: z.string().min(1, 'URL slug不能为空'),
  description: z.string().min(1, '描述不能为空'),
  thumbnail: z.string().optional(),
  fileSize: z.string().optional(),
  version: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  typeId: z.string(),
  categoryId: z.string(),
  metadata: z.any().optional(),
  previews: z.array(z.any()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  downloadLinks: z.array(z.object({
    provider: z.string(),
    url: z.string(),
    price: z.string().optional(),
    platform: z.string().optional(),
    quality: z.string().optional(),
    isActive: z.boolean().default(true),
    metadata: z.any().optional()
  })).optional(),
  tagIds: z.array(z.string()).optional()
})

// 认证中间件
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('未提供认证令牌')
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any

    // 检查会话是否有效
    const session = await prisma.adminSession.findFirst({
      where: {
        token,
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
    // 认证检查
    const auth = await authenticate(request)

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const typeId = searchParams.get('typeId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}

    if (status) where.status = status
    if (typeId) where.typeId = typeId
    if (categoryId) where.categoryId = categoryId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 获取资源列表
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          type: true,
          category: true,
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
          },
          downloadLinks: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: {
              downloadLinks: true
            }
          }
        }
      }),
      prisma.resource.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        resources,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('获取资源列表错误:', error)

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

export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const auth = await authenticate(request)

    // 解析请求体
    const body = await request.json()
    const validatedData = resourceSchema.parse(body)

    // 检查slug是否已存在
    const existingResource = await prisma.resource.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingResource) {
      return NextResponse.json(
        { error: 'URL slug已存在，请使用其他slug' },
        { status: 400 }
      )
    }

    // 创建资源
    const resource = await prisma.resource.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        thumbnail: validatedData.thumbnail,
        fileSize: validatedData.fileSize,
        version: validatedData.version,
        status: validatedData.status,
        publishedAt: validatedData.status === 'published' ? new Date() : undefined,
        typeId: validatedData.typeId,
        categoryId: validatedData.categoryId,
        metadata: JSON.stringify(validatedData.metadata || {}),
        previews: JSON.stringify(validatedData.previews || []),
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        keywords: validatedData.keywords,
        downloadLinks: validatedData.downloadLinks ? {
          create: validatedData.downloadLinks
        } : undefined,
        tags: validatedData.tagIds ? {
          connect: validatedData.tagIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        type: true,
        category: true,
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
        },
        downloadLinks: true
      }
    })

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: auth.userId,
        action: 'create',
        resource: 'resource',
        resourceId: resource.id,
        details: JSON.stringify({
          resourceTitle: resource.title,
          resourceSlug: resource.slug
        }),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: '资源创建成功',
      data: { resource }
    })

  } catch (error) {
    console.error('创建资源错误:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

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