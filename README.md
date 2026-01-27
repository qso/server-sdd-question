# 服务端开发 AI 研发提效问卷

一个用于收集服务端开发同学日常工作时间分配数据的问卷系统。

## 功能特性

- ✨ **交互式滑块**: 调整一个滑块时,其他滑块自动按比例缩放,保持总和为 100%
- ⌨️ **直接输入**: 每个滑块右侧的百分比支持直接输入,失去焦点后自动调整其他滑块
- 📊 **分组展示**: 研发流程全过程(15项)和日常事项(7项)分两个区域展示
- ✅ **实时验证**: 实时显示当前百分比总和,必须为 100% 才能提交
- 🔄 **同名覆盖**: 相同姓名的提交会覆盖之前的数据
- 📱 **响应式设计**: 支持手机、平板、桌面端访问
- 📈 **管理后台**: 查看所有提交数据和统计信息

## 技术栈

- **框架**: Next.js 15 (App Router) + TypeScript
- **数据库**: Vercel Postgres
- **UI**: Tailwind CSS + shadcn/ui
- **验证**: Zod
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并配置 Vercel Postgres 连接字符串:

\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 `.env.local` 填入实际的数据库连接信息:

\`\`\`env
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
\`\`\`

### 3. 初始化数据库

运行数据库初始化脚本创建表结构:

\`\`\`bash
npm run setup-db
\`\`\`

### 4. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看问卷页面。

访问 [http://localhost:3000/admin](http://localhost:3000/admin) 查看管理后台。

## 部署到 Vercel

### 方式一: 通过 Vercel CLI

1. 安装 Vercel CLI:
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. 登录并部署:
   \`\`\`bash
   vercel
   \`\`\`

### 方式二: 通过 Vercel Dashboard

1. 访问 [vercel.com](https://vercel.com)
2. 导入 Git 仓库
3. 添加 Vercel Postgres 数据库
4. 部署项目

### 3. 配置 Vercel Postgres

1. 在 Vercel Dashboard 中,进入项目设置
2. 点击 **Storage** → **Create Database** → **Postgres**
3. 创建数据库后,环境变量会自动配置
4. 在本地拉取环境变量:
   \`\`\`bash
   vercel env pull
   \`\`\`

5. 运行数据库初始化:
   \`\`\`bash
   npm run setup-db
   \`\`\`

## 项目结构

\`\`\`
server-sdd-question/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx                # 问卷表单页面
│   │   ├── admin/page.tsx          # 管理后台页面
│   │   └── globals.css             # 全局样式
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 组件
│   │   └── survey/                 # 问卷组件
│   │       ├── SurveyForm.tsx      # 主表单容器
│   │       ├── SliderGroup.tsx     # 分组滑块
│   │       ├── TimeSlider.tsx      # 单个滑块
│   │       └── ValidationDisplay.tsx # 验证显示
│   └── lib/
│       ├── constants.ts            # 问卷分类定义
│       ├── validations.ts          # Zod 验证规则
│       ├── db.ts                   # 数据库查询
│       ├── actions.ts              # Server Actions
│       └── utils.ts                # 工具函数
├── scripts/
│   └── setup-db.ts                 # 数据库初始化脚本
└── package.json
\`\`\`

## 核心功能说明

### 比例缩放算法

当用户调整某个滑块时,其他滑块会按当前比例自动缩放,确保总和始终为 100%:

\`\`\`typescript
const handleSliderChange = (key: string, newValue: number) => {
  const otherKeys = Object.keys(values).filter(k => k !== key);
  const otherSum = otherKeys.reduce((sum, k) => sum + values[k], 0);
  const remaining = 100 - newValue;

  const scaleFactor = remaining / otherSum;
  const newValues = { [key]: newValue };
  otherKeys.forEach(k => {
    newValues[k] = values[k] * scaleFactor;
  });
  setValues(newValues);
};
\`\`\`

### 同名覆盖

数据库使用 `ON CONFLICT (name) DO UPDATE` 语法实现同名覆盖:

\`\`\`sql
INSERT INTO survey_responses (...)
VALUES (...)
ON CONFLICT (name) DO UPDATE SET
  team = EXCLUDED.team,
  ...
\`\`\`

### 数据验证

- 客户端: React state 实时验证总和是否为 100%
- 服务端: Zod schema 验证 + 数据库 CHECK 约束双重保障

## API 端点

### Server Actions

- `submitSurvey(formData)`: 提交问卷数据

### 数据库查询

- `createSurveyResponse(data)`: 创建/更新问卷记录
- `getAllSurveyResponses()`: 获取所有问卷记录
- `getSurveyStats()`: 获取统计数据

## 常见问题

### Q: 如何修改问卷选项?

编辑 `src/lib/constants.ts` 文件,在 `SURVEY_CATEGORIES` 中添加或修改选项。

注意:修改后需要同步更新:
1. `src/lib/validations.ts` 的 Zod schema
2. `src/lib/db.ts` 的数据库查询
3. `scripts/setup-db.ts` 的表结构
4. `src/app/admin/page.tsx` 的数据计算

### Q: 如何备份数据?

在 Vercel Dashboard 的 Postgres 面板中可以导出数据,或使用 SQL 查询:

\`\`\`sql
SELECT * FROM survey_responses;
\`\`\`

### Q: 本地开发时如何连接数据库?

可以使用本地 PostgreSQL,或连接 Vercel Postgres:

\`\`\`bash
vercel env pull .env.local
\`\`\`

## 开发命令

\`\`\`bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run start      # 启动生产服务器
npm run lint       # 运行 ESLint
npm run setup-db   # 初始化数据库
\`\`\`

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request!
