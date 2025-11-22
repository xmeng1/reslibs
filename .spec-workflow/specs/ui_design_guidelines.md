# UI Design Guidelines & Reference

**Reference Site**: `https://www.koudaizy.com/tutorials/unitycourse/`
**Target Style**: Clean, Grid-based, Content-focused.

## 1. 布局分析 (Layout Analysis)
请 Claude Code 在构建前端时严格参考以下结构：

* **Header (顶部导航)**:
    * 左侧: Logo (`Unity ResLibs`)
    * 中间: 搜索框 (Search Bar) - 必须显眼，圆角设计。
    * 右侧: 简单的分类链接 (Assets, Tutorials, Tools)。
* **Main Content (资源列表)**:
    * 采用 **Grid Layout** (CSS Grid)。
    * Desktop: 4列; Tablet: 2-3列; Mobile: 1列。
* **Card Component (资源卡片)**:
    * **Thumbnail**: 顶部是大图，比例约为 16:9，圆角。
    * **Title**: 位于图片下方，字体加粗，两行省略。
    * **Meta Info**: 底部显示 "Unity版本", "文件大小", "更新日期" (用小图标+文字)。
    * **Hover Effect**: 鼠标悬停时，卡片轻微上浮并增加阴影 (Elevation)。

## 2. 详情页 (Detail Page)
* **两栏布局**: 左侧 (70%) 内容，右侧 (30%) 侧边栏。
* **左侧**:
    * 大标题。
    * 大封面图。
    * **Description**: Markdown 渲染区域，样式需清晰（H2, H3, List 间距合理）。
    * **Download Section**: 位于文章底部，使用显眼的 Button 组 (e.g., "Download via Rapidgator", "Download via ChengTong")。
* **右侧**:
    * "Latest Resources" (最新资源)。
    * "Related Posts" (相关推荐)。

## 3. 配色方案 (Color Palette)
* **Primary**: Deep Blue/Purple (类似 Unity 的官方色调或参考站点的色调)。
* **Background**: Very light gray (`#f8f9fa`) 或 White，保持干净。
* **Text**: Dark gray (`#333`) for headings, lighter gray (`#666`) for body.