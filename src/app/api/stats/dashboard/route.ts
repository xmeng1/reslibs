import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 获取基础统计数据
    const [
      totalResources,
      publishedResources,
      totalDownloads,
      totalViews,
      totalUsers,
      recentResources,
      popularResources,
      resourcesByType,
      resourcesByCategory
    ] = await Promise.all([
      // 总资源数
      prisma.resource.count(),

      // 已发布资源数
      prisma.resource.count({ where: { status: 'published' } }),

      // 总下载量
      prisma.resource.aggregate({
        _sum: { downloadCount: true }
      }),

      // 总浏览量
      prisma.resource.aggregate({
        _sum: { viewCount: true }
      }),

      // 管理员用户数
      prisma.adminUser.count({ where: { isActive: true } }),

      // 最新资源
      prisma.resource.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { status: 'published' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          downloadCount: true,
          type: {
            select: {
              displayName: true,
              icon: true
            }
          }
        }
      }),

      // 热门资源
      prisma.resource.findMany({
        take: 5,
        orderBy: { downloadCount: 'desc' },
        where: { status: 'published' },
        select: {
          id: true,
          title: true,
          downloadCount: true,
          viewCount: true,
          type: {
            select: {
              displayName: true,
              icon: true
            }
          }
        }
      }),

      // 按类型统计
      prisma.resourceType.findMany({
        include: {
          _count: {
            select: {
              resources: {
                where: { status: 'published' }
              }
            }
          }
        }
      }),

      // 按分类统计
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              resources: {
                where: { status: 'published' }
              }
            }
          }
        }
      })
    ])

    const stats = {
      overview: {
        totalResources,
        publishedResources,
        totalDownloads: totalDownloads._sum.downloadCount || 0,
        totalViews: totalViews._sum.viewCount || 0,
        totalUsers,
        publishedRate: totalResources > 0 ? Math.round((publishedResources / totalResources) * 100) : 0
      },
      recentResources,
      popularResources,
      resourcesByType: resourcesByType.map(type => ({
        id: type.id,
        name: type.displayName,
        icon: type.icon,
        count: type._count.resources
      })),
      resourcesByCategory: resourcesByCategory.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        count: category._count.resources
      }))
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('获取统计数据错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}