import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: []
        }
      })
    }

    const searchQuery = query.trim()

    // 获取匹配的资源标题作为建议
    const resources = await prisma.resource.findMany({
      where: {
        status: 'published',
        title: { contains: searchQuery }
      },
      take: limit,
      select: {
        id: true,
        title: true,
        type: {
          select: {
            icon: true,
            displayName: true
          }
        }
      }
    })

    // 获取匹配的标签作为建议
    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: searchQuery }
      },
      take: Math.floor(limit / 2),
      select: {
        id: true,
        name: true,
        color: true
      }
    })

    const suggestions = [
      ...resources.map(r => ({
        id: r.id,
        text: r.title,
        type: 'resource',
        icon: r.type.icon,
        category: r.type.displayName
      })),
      ...tags.map(t => ({
        id: t.id,
        text: t.name,
        type: 'tag',
        color: t.color
      }))
    ].slice(0, limit)

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        query: searchQuery
      }
    })

  } catch (error) {
    console.error('搜索建议错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}