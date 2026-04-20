# Unsplash Mock

一个简洁的 Unsplash Mock 图片数据生成工具。

## 功能

- **图片搜索** — 从 Unsplash 搜索高质量免费图片
- **批量下载** — 支持分页、自定义每页数量
- **多语言代码生成** — TypeScript / Go / Python / Rust / Java / JSON / Markdown
- **OSS 上传** — 一键上传到阿里云 OSS 并获取 CDN 链接

## 技术栈

- Nuxt 4 + Vue 3
- Tailwind CSS 4
- shadcn-vue
- oss-lite

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置环境变量
touch .env
# 编辑 .env，填入 Unsplash API Key 和 OSS 配置

# 开发
pnpm dev

# 构建
pnpm build
```

## 环境变量

```env
NUXT_UNSPLASH_ACCESS_KEY=your_unsplash_key
NUXT_OSS_ACCESS_KEY_ID=your_oss_key
NUXT_OSS_ACCESS_KEY_SECRET=your_oss_secret
NUXT_OSS_BUCKET=your_bucket
NUXT_OSS_REGION=oss-cn-beijing
NUXT_OSS_CDN_BASE_URL=https://your-cdn.com
```

---

[Unsplash](https://unsplash.com) · [shadcn-vue](https://www.shadcn-vue.com)
