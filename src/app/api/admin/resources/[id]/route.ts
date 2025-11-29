import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

// 资源更新验证模式
const updateResourceSchema = z.object({
  title: z.string().min(1, '标题不能为空').optional(),
  slug: z.string().min(1, 'URL slug不能为空').optional(),
  description: z.string().min(1, '描述不能为空').optional(),
  thumbnail: z.string().optional(),
  fileSize: z.string().optional(),
  version: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  typeId: z.string().optional(),
  categoryId: z.string().optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 认证检查
    const auth = await authenticate(request)

    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: {
        type: true,
        category: true,
        tags: true,
        downloadLinks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!resource) {
      return NextResponse.json(
        { error: '资源不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { resource }
    })

  } catch (error) {
    console.error('获取资源详情错误:', error)

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 认证检查
    const auth = await authenticate(request)

    // 解析请求体
    const body = await request.json()
    const validatedData = updateResourceSchema.parse(body)

    // 检查资源是否存在
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id }
    })

    if (!existingResource) {
      return NextResponse.json(
        { error: '资源不存在' },
        { status: 404 }
      )
    }

    // 如果更新slug，检查是否已存在
    if (validatedData.slug && validatedData.slug !== existingResource.slug) {
      const slugExists = await prisma.resource.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'URL slug已存在，请使用其他slug' },
          { status: 400 }
        )
      }
    }

    // 更新资源
    const updateData: any = {}

    Object.keys(validatedData).forEach(key => {
      if (validatedData[key as keyof typeof validatedData] !== undefined) {
        if (key === 'tagIds') {
          updateData.tags = {
            set: [],
            connect: validatedData.tagIds?.map(id => ({ id }))
          }
        } else if (key === 'downloadLinks') {
          // 重新设置下载链接
          updateData.downloadLinks = {
            deleteMany: {},
            create: validatedData.downloadLinks
          }
        } else {
          updateData[key] = validatedData[key as keyof typeof validatedData]
        }
      }
    })

    // 如果状态改为发布，设置发布时间
    if (validatedData.status === 'published' && existingResource.status !== 'published') {
      updateData.publishedAt = new Date()
    }

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: updateData,
      include: {
        type: true,
        category: true,
        tags: true,
        downloadLinks: true
      }
    })

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: auth.userId,
        action: 'update',
        resource: 'resource',
        resourceId: resource.id,
        details: {
          resourceTitle: resource.title,
          resourceSlug: resource.slug,
          updatedFields: Object.keys(validatedData)
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: '资源更新成功',
      data: { resource }
    })

  } catch (error) {
    console.error('更新资源错误:', error)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 认证检查
    const auth = await authenticate(request)

    // 检查资源是否存在
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        slug: true
      }
    })

    if (!existingResource) {
      return NextResponse.json(
        { error: '资源不存在' },
        { status: 404 }
      )
    }

    // 删除资源（级联删除相关数据）
    await prisma.resource.delete({
      where: { id: params.id }
    })

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: auth.userId,
        action: 'delete',
        resource: 'resource',
        resourceId: existingResource.id,
        details: {
          resourceTitle: existingResource.title,
          resourceSlug: existingResource.slug
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: '资源删除成功'
    })

  } catch (error) {
    console.error('删除资源错误:', error)

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