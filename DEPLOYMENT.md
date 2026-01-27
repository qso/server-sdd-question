# 部署指南

本文档详细说明如何部署和使用问卷系统。

## 快速开始

### 方式一: 使用 Neon DB (推荐 - 当前使用)

本项目已配置使用 Neon Serverless Postgres 数据库。

#### 1. 环境配置

如果您是新的开发者加入项目：

```bash
# 克隆项目
git clone https://github.com/qso/server-sdd-question.git
cd server-sdd-question

# 安装依赖
npm install

# 从 Vercel 拉取环境变量（需要先登录 Vercel）
vercel login
vercel link  # 选择已有项目 qsos-projects/server-sdd-question
vercel env pull .env.local

# 检查数据库表结构
npm run check-schema

# 本地运行
npm run dev
```

访问 http://localhost:3000 即可看到问卷。

#### 2. 数据库表结构

数据库采用简化的 JSON 存储架构：

```sql
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  team VARCHAR(255) NOT NULL,
  time_allocation TEXT NOT NULL,  -- JSON 格式存储所有时间分配
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_survey_responses_name ON survey_responses(name);
CREATE INDEX idx_survey_responses_team ON survey_responses(team);
```

**关键特性**：
- 使用 `time_allocation` TEXT 字段存储 JSON
- 前端验证 100% 总和约束，服务端不做强制验证
- 通过 `name` 字段去重（同名覆盖）
- 支持按 `team` 和 `name` 查询

#### 3. 部署到 Vercel

代码推送到 GitHub 后，Vercel 会自动检测并部署：

```bash
git add .
git commit -m "your changes"
git push origin main
```

Vercel 会自动：
- 检测代码变更
- 运行 `npm run build`
- 部署到生产环境
- 使用配置好的 Neon DB 环境变量

#### 4. 查看部署状态

访问 Vercel Dashboard:
- 项目地址: https://vercel.com/qsos-projects/server-sdd-question
- 查看部署日志
- 查看环境变量配置

---

## 常用命令

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器（本地）
npm start
```

### 数据库管理

```bash
# 检查数据库表结构
npx tsx scripts/check-schema.ts

# 初始化数据库（如果表不存在）
npm run setup-db

# 从旧架构迁移到新架构（如果需要）
npx tsx scripts/migrate-to-json-schema.ts
```

### 环境变量管理

```bash
# 从 Vercel 拉取环境变量
vercel env pull .env.local

# 查看当前环境变量
cat .env.local
```

---

## 问卷系统说明

### 功能特性

1. **基本信息**
   - 姓名（必填，唯一标识）
   - 小组（下拉选择，10个预设选项）

2. **时间分配**
   - **研发流程**（13个环节）：需求评审、拆单排期、技术方案产出、技术方案评审、测试用例产出、测试用例评审、代码开发、功能联调、冒烟测试、功能测试、Bugfix、代码Review、功能上线
   - **日常事项**（6个环节）：告警治理、异常日志、日常答疑、舆情排查、开会、线上问题应急

3. **交互特性**
   - 拖动滑块分配时间比例
   - 直接输入百分比数值
   - 实时显示总和和剩余百分比
   - 比例调整时其他滑块自动按比例缩放
   - 必须总和为 100% 才能提交

4. **数据管理**
   - 同名用户提交会覆盖之前的数据
   - 访问 `/admin` 查看所有提交记录
   - 显示统计数据（总提交数、平均研发流程占比、平均日常事项占比）

### 项目结构

```
server-sdd-question/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 问卷主页
│   │   ├── admin/page.tsx        # 后台数据页面
│   │   └── layout.tsx            # 根布局
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 组件
│   │   └── survey/
│   │       ├── SurveyForm.tsx    # 主表单组件
│   │       ├── SliderGroup.tsx   # 滑块组
│   │       ├── TimeSlider.tsx    # 单个滑块
│   │       └── ValidationDisplay.tsx  # 验证提示
│   └── lib/
│       ├── constants.ts          # 问卷字段定义
│       ├── validations.ts        # Zod 验证规则
│       ├── db.ts                 # 数据库操作
│       └── actions.ts            # Server Actions
├── scripts/
│   ├── setup-db.ts               # 数据库初始化
│   ├── check-schema.ts           # 检查表结构
│   └── migrate-to-json-schema.ts # 架构迁移
└── .env.local                    # 环境变量（本地）
```

---

## 方式二: 使用 Vercel Postgres（备选方案）

如果将来想切换到 Vercel Postgres：

### 1. 创建数据库

1. 进入 Vercel 项目 Dashboard
2. 点击 **Storage** → **Create Database**
3. 选择 **Postgres**
4. 选择区域（推荐 ap-southeast-1）
5. 点击 **Create**

### 2. 环境变量自动配置

Vercel Postgres 会自动添加这些环境变量：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 3. 初始化数据库

```bash
# 拉取环境变量
vercel env pull .env.local

# 运行初始化脚本
npm run setup-db
```

---

## 监控和调试

### 查看日志

在 Vercel Dashboard:
1. 进入项目
2. 点击 **Deployments**
3. 选择具体的部署
4. 点击 **Functions** 查看日志

### 本地调试

```bash
# 查看构建输出
npm run build

# 查看详细日志
npm run dev
```

### 数据库查询

使用 Neon 控制台：
1. 访问 https://console.neon.tech
2. 选择你的项目
3. 使用 SQL Editor 执行查询

示例查询：
```sql
-- 查看所有提交
SELECT * FROM survey_responses ORDER BY updated_at DESC;

-- 按小组统计
SELECT team, COUNT(*) as count FROM survey_responses GROUP BY team;

-- 查看某个用户的数据
SELECT * FROM survey_responses WHERE name = '张三';
```

---

## 故障排查

### 问题: 本地运行时数据库连接失败

**解决方案**:
```bash
# 确认环境变量文件存在
ls -la .env.local

# 重新拉取环境变量
vercel env pull .env.local

# 检查数据库连接
npx tsx scripts/check-schema.ts
```

### 问题: Build 失败

**解决方案**:
```bash
# 本地测试构建
npm run build

# 检查 TypeScript 错误
npm run type-check  # 如果有这个脚本

# 查看 Vercel 构建日志
vercel logs
```

### 问题: 部署成功但功能异常

**解决方案**:
1. 检查环境变量是否在 Vercel 中正确配置
2. 查看 Function 日志中的错误信息
3. 确认数据库表已正确创建
4. 在本地使用生产环境变量测试

---

## 安全建议

### 1. 保护管理后台

目前 `/admin` 页面无需认证。如需添加保护，创建 `src/middleware.ts`：

```typescript
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
```

在 Vercel 添加环境变量:
```
ADMIN_PASSWORD=your-secure-password
```

### 2. 数据库安全

- ✅ 使用 SSL 连接（Neon 默认启用）
- ✅ 连接字符串存储在环境变量中
- ✅ 不在代码中硬编码密码

### 3. 输入验证

- ✅ 前端使用 Zod 验证
- ✅ 服务端 Server Actions 验证
- ✅ 数据库 UNIQUE 约束防止重复

---

## 性能优化

### 1. 数据库优化

已创建索引：
- `idx_survey_responses_name` - 用于快速查找和去重
- `idx_survey_responses_team` - 用于按小组过滤

### 2. Next.js 优化

- ✅ 使用 Server Components (admin 页面)
- ✅ 使用 Client Components (表单交互)
- ✅ 动态路由标记为 `force-dynamic`

### 3. 缓存策略

Admin 页面配置：
```typescript
export const dynamic = 'force-dynamic'; // 实时数据
```

---

## 维护和更新

### 添加新的时间分配字段

由于使用 JSON 存储，添加新字段非常简单：

1. 编辑 `src/lib/constants.ts`，在相应分类中添加字段：
```typescript
{ key: 'new_field', label: '新字段名称' }
```

2. 推送代码，自动部署

3. 无需修改数据库表结构！

### 修改小组选项

编辑 `src/lib/constants.ts` 中的 `TEAM_OPTIONS`：
```typescript
export const TEAM_OPTIONS = [
  '新小组名称',
  // ... 其他小组
] as const;
```

### 备份数据

```bash
# 导出数据（需要配置 pg_dump 或使用 Neon 控制台）
# 在 Neon 控制台可以直接导出 CSV
```

---

## 成本估算

### Vercel
- **Hobby Plan**: 免费
  - 100GB 带宽/月
  - 无限部署
  - 自动 HTTPS

### Neon DB
- **Free Plan**: 免费
  - 0.5GB 存储
  - 每月 191.9 小时活跃时间
  - 自动休眠（非活跃时）
  - 适合中小型问卷项目

对于内部问卷系统，免费套餐完全足够使用。

---

## 技术栈

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Neon Serverless Postgres
- **ORM/Client**: @vercel/postgres
- **UI**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Deployment**: Vercel

---

## 支持和帮助

- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 文档](https://vercel.com/docs)
- [Neon 文档](https://neon.tech/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)

---

## 部署检查清单

部署完成后，验证以下功能：

- [ ] 访问主页显示问卷
- [ ] 可以拖动滑块调整比例
- [ ] 可以直接输入百分比
- [ ] 总和不为 100% 时提交按钮禁用
- [ ] 可以成功提交问卷
- [ ] 同名提交会覆盖之前的数据
- [ ] 访问 `/admin` 可以看到提交记录
- [ ] 统计数据显示正确
- [ ] 移动端显示正常

---

**最后更新**: 2026-01-27
**当前架构**: JSON 存储 (简化架构)
**数据库**: Neon Serverless Postgres
