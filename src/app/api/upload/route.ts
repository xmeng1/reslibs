import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 解析multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '未选择文件' },
        { status: 400 }
      )
    }

    // 验证文件类型和大小
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 JPG、PNG、GIF、WebP 格式' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      )
    }

    // 这里应该实现实际的文件上传逻辑
    // 例如上传到云存储服务或本地文件系统
    // 为了简化，我们返回一个模拟的成功响应

    const fileUrl = `/uploads/${file.name}`
    const timestamp = Date.now()

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(timestamp).toISOString()
      }
    })

  } catch (error) {
    console.error('文件上传错误:', error)
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    )
  }
}