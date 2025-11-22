# Third Party Integrations

## 1. Baidu Netdisk
* **Tool**: `BaiduPCS-Go` (Compiled binary)
* **Auth**: 需要在 `.env` 中配置 `BDUSS` 和 `STOKEN`。

## 2. AI Content Provider
* **Provider**: Google Gemini Pro 1.5 (推荐，免费额度高且上下文长) 或 Claude 3.5 Sonnet。
* **API Key**: `GEMINI_API_KEY`

## 3. PPD File Hosts (网赚盘)
* **Rapidgator**: 支持 FTP 上传 (Host, User, Pass)。
* **诚通网盘 (Ctfile)**: 需要查阅其开发者文档，通常提供 API 或 WebDAV。
* **飞猫云 (Feimaoyun)**: 提供 API 接口用于上传和获取链接。

## 4. Image Hosting
* **Provider**: Cloudflare R2 (兼容 S3 API，无出口流量费)。