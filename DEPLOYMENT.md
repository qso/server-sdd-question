# Vercel 部署指南

本文档详细说明如何将问卷系统部署到 Vercel。

## 准备工作

1. 注册 [Vercel 账号](https://vercel.com/signup)
2. 安装 [Vercel CLI](https://vercel.com/docs/cli) (可选)
3. 将代码推送到 Git 仓库(GitHub/GitLab/Bitbucket)

## 部署步骤

### 方式一: 通过 Vercel Dashboard (推荐)

#### 1. 导入项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **Add New...** → **Project**
3. 选择你的 Git 仓库
4. 点击 **Import**

#### 2. 配置项目

- **Framework Preset**: Next.js (自动检测)
- **Root Directory**: `./` (默认)
- **Build Command**: `npm run build` (默认)
- **Output Directory**: `.next` (默认)
- **Install Command**: `npm install` (默认)

保持默认配置即可,点击 **Deploy**。

#### 3. 创建 Postgres 数据库

部署完成后:

1. 进入项目 Dashboard
2. 点击 **Storage** 标签
3. 点击 **Create Database**
4. 选择 **Postgres**
5. 选择区域(推荐选择离用户最近的区域)
6. 点击 **Create**

Vercel 会自动配置以下环境变量:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

#### 4. 初始化数据库

数据库创建完成后,需要初始化表结构:

**方式 A: 使用 Vercel CLI (推荐)**

\`\`\`bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 拉取环境变量到本地
vercel env pull

# 运行数据库初始化脚本
npm run setup-db
\`\`\`

**方式 B: 使用 Vercel Postgres Dashboard**

1. 进入 Vercel Postgres 数据库页面
2. 点击 **Query** 标签
3. 复制 `scripts/setup-db.ts` 中的 SQL 语句
4. 粘贴到查询框执行

示例 SQL:

\`\`\`sql
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  team VARCHAR(255) NOT NULL,
  time_allocation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_name ON survey_responses(name);
CREATE INDEX IF NOT EXISTS idx_survey_responses_team ON survey_responses(team);
\`\`\`

> **注意**: 数据库采用简化的JSON存储架构，所有时间分配数据存储在 `time_allocation` TEXT 字段中。验证逻辑仅在前端进行，服务端不做100%总和约束。

#### 5. 验证部署

1. 访问部署的 URL (如 `https://your-project.vercel.app`)
2. 测试提交问卷
3. 访问 `/admin` 页面查看数据

### 方式二: 通过 Vercel CLI

\`\`\`bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 按提示选择配置
# Set up and deploy? [Y/n] Y
# Which scope? [Your Account]
# Link to existing project? [y/N] N
# What's your project's name? server-sdd-question
# In which directory is your code located? ./
# Want to override the settings? [y/N] N

# 部署到生产环境
vercel --prod
\`\`\`

## 更新部署

### 自动部署

1. 推送代码到 Git 仓库的主分支
2. Vercel 自动检测变更并重新部署

### 手动部署

\`\`\`bash
vercel --prod
\`\`\`

## 环境变量管理

### 查看环境变量

在 Vercel Dashboard:
1. 进入项目
2. 点击 **Settings**
3. 点击 **Environment Variables**

### 添加自定义环境变量

如果需要添加额外的环境变量:

1. 在 Settings → Environment Variables 页面
2. 点击 **Add New**
3. 输入 Key 和 Value
4. 选择应用环境 (Production / Preview / Development)
5. 点击 **Save**

### 本地拉取环境变量

\`\`\`bash
vercel env pull .env.local
\`\`\`

## 自定义域名

### 1. 添加域名

1. 进入项目 Settings
2. 点击 **Domains**
3. 输入你的域名
4. 点击 **Add**

### 2. 配置 DNS

根据 Vercel 提供的 DNS 记录配置:

**A 记录 (推荐)**:
\`\`\`
Type: A
Name: @
Value: 76.76.21.21
\`\`\`

**CNAME 记录**:
\`\`\`
Type: CNAME
Name: www
Value: cname.vercel-dns.com
\`\`\`

### 3. 等待验证

DNS 配置后,等待 Vercel 验证(通常几分钟到几小时)。

## 性能优化

### 1. 启用 Edge Runtime (可选)

编辑 `src/app/page.tsx`:

\`\`\`typescript
export const runtime = 'edge';
\`\`\`

### 2. 配置 Cache

编辑 `src/app/admin/page.tsx` 保持:

\`\`\`typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
\`\`\`

### 3. 优化图片

如果添加图片,使用 Next.js Image 组件:

\`\`\`typescript
import Image from 'next/image';
\`\`\`

## 监控和调试

### 1. 查看日志

在 Vercel Dashboard:
1. 进入项目
2. 点击 **Deployments**
3. 选择具体的部署
4. 点击 **Functions** 查看日志

### 2. 实时日志

\`\`\`bash
vercel logs --follow
\`\`\`

### 3. Analytics

Vercel 提供内置的 Analytics:
1. 进入项目
2. 点击 **Analytics**
3. 查看访问量、性能等指标

## 故障排查

### 问题: 数据库连接失败

**解决方案**:
1. 检查环境变量是否正确配置
2. 确认数据库已创建并运行
3. 查看 Function 日志获取详细错误信息

### 问题: Build 失败

**解决方案**:
1. 检查本地是否能正常 build:
   \`\`\`bash
   npm run build
   \`\`\`
2. 查看 Vercel build 日志
3. 确认所有依赖都在 `package.json` 中

### 问题: 函数超时

**解决方案**:
1. 优化数据库查询
2. 添加索引
3. 考虑使用 Edge Runtime

## 安全建议

### 1. 保护管理后台

添加简单的密码保护:

\`\`\`typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization');

    if (!basicAuth) {
      return new Response('Auth required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin"',
        },
      });
    }

    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

    if (user !== 'admin' || pwd !== process.env.ADMIN_PASSWORD) {
      return new Response('Invalid auth', { status: 401 });
    }
  }

  return NextResponse.next();
}
\`\`\`

添加环境变量:
\`\`\`
ADMIN_PASSWORD=your-secure-password
\`\`\`

### 2. 启用 Rate Limiting

Vercel 提供内置的 DDoS 保护,但可以添加额外的限制。

### 3. HTTPS

Vercel 自动为所有域名提供 HTTPS。

## 成本估算

Vercel 提供免费的 Hobby 计划,包括:
- 100GB 带宽/月
- 无限部署
- 自动 HTTPS
- Edge Network

Vercel Postgres 价格:
- Starter: $0/月 (60小时计算时间 + 256MB 存储)
- Pro: $24/月起

对于小型问卷项目,免费套餐通常足够使用。

## 备份和恢复

### 备份数据

\`\`\`bash
# 使用 Vercel CLI 拉取环境变量
vercel env pull

# 导出数据
npm run backup  # 需要自己添加这个脚本
\`\`\`

### 恢复数据

\`\`\`sql
-- 在 Vercel Postgres Query 中执行
INSERT INTO survey_responses VALUES (...);
\`\`\`

## 支持和帮助

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)

---

部署完成后,记得测试所有功能:
- ✅ 提交问卷
- ✅ 查看管理后台
- ✅ 同名覆盖功能
- ✅ 数据统计正确性
