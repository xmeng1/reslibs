# Data Model (Prisma Schema Idea)

```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text // Markdown 内容
  thumbnail   String?  // 封面图 URL
  images      String[] // 预览图列表
  
  // 资源元数据
  unityVersion String? // 譬如 "2021.3+"
  fileSize     String?
  
  // 下载链接 (JSON 存储多网盘链接)
  // 格式: [{"provider": "Rapidgator", "url": "...", "price": "Free"}, {"provider": "Chengtong", "url": "..."}]
  downloadLinks Json 
  
  tags        Tag[]
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String

  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id    String @id @default(cuid())
  name  String
  slug  String @unique
  posts Post[]
}

model Tag {
  id    String @id @default(cuid())
  name  String
  posts Post[]
}