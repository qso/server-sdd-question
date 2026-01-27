# 服务端开发 AI 研发提效问卷

一个用于收集服务端开发人员时间分配数据的问卷系统，帮助评估 AI 工具在研发流程中的提效潜力。

## ✨ 功能特性

- 📝 **交互式问卷**：使用滑块和输入框分配时间比例
- 🔄 **智能平衡**：拖动一个滑块时，其他滑块自动按比例调整
- ✅ **实时验证**：确保总和为 100% 才能提交
- 📊 **数据后台**：查看所有提交记录和统计数据
- 🔒 **去重逻辑**：同名提交自动覆盖之前的数据
- 📱 **响应式设计**：支持手机、平板、桌面端访问

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/qso/server-sdd-question.git
cd server-sdd-question

# 安装依赖
npm install

# 从 Vercel 拉取环境变量（需要先登录）
vercel login
vercel link
vercel env pull .env.local

# 检查数据库表结构
npm run check-schema

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看问卷。
访问 http://localhost:3000/admin 查看管理后台。

## 📋 问卷内容

### 基本信息
- 姓名（必填，唯一标识）
- 小组（下拉选择，10个预设选项）

### 时间分配（总和必须 100%）

**研发流程全过程**（13个环节）：
需求评审、拆单排期、技术方案产出、技术方案评审、测试用例产出、测试用例评审、代码开发、功能联调、冒烟测试、功能测试、Bugfix、代码Review、功能上线

**日常事项**（6个环节）：
告警治理、异常日志、日常答疑、舆情排查、开会、线上问题应急

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: Neon Serverless Postgres
- **UI**: Tailwind CSS + shadcn/ui
- **验证**: Zod
- **部署**: Vercel

## 🗄️ 数据库架构

简化的 JSON 存储架构：

```sql
CREATE TABLE survey_responses (
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

**架构优势**：
- ✅ 灵活的 JSON 存储，易于扩展
- ✅ 添加新字段无需修改数据库表结构
- ✅ 前端验证 100% 总和，服务端验证数据格式
- ✅ 通过 `name` 字段实现去重

## 📁 项目结构

```
server-sdd-question/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 问卷主页
│   │   ├── admin/page.tsx        # 数据后台
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 组件
│   │   └── survey/
│   │       ├── SurveyForm.tsx    # 主表单
│   │       ├── SliderGroup.tsx   # 滑块组
│   │       ├── TimeSlider.tsx    # 单个滑块（支持直接输入）
│   │       └── ValidationDisplay.tsx
│   └── lib/
│       ├── constants.ts          # 问卷字段定义
│       ├── validations.ts        # Zod 验证
│       ├── db.ts                 # 数据库操作
│       └── actions.ts            # Server Actions
├── scripts/
│   ├── setup-db.ts               # 数据库初始化
│   ├── check-schema.ts           # 检查表结构
│   └── migrate-to-json-schema.ts # 架构迁移
└── .env.local                    # 环境变量（本地）
```

## 💡 核心功能说明

### 比例缩放算法

当用户调整某个滑块时，其他滑块会按当前比例自动缩放，确保总和始终为 100%：

```typescript
const handleSliderChange = (key: string, newValue: number) => {
  const otherKeys = Object.keys(values).filter(k => k !== key);
  const otherSum = otherKeys.reduce((sum, k) => sum + values[k], 0);
  const remaining = 100 - newValue;

  // 按比例缩放其他滑块
  const scaleFactor = remaining / otherSum;
  const newValues = { [key]: newValue };
  otherKeys.forEach(k => {
    newValues[k] = values[k] * scaleFactor;
  });
  setValues(newValues);
};
```

### 同名覆盖

数据库使用 `ON CONFLICT (name) DO UPDATE` 语法实现同名覆盖：

```sql
INSERT INTO survey_responses (name, team, time_allocation)
VALUES ($1, $2, $3)
ON CONFLICT (name) DO UPDATE SET
  team = EXCLUDED.team,
  time_allocation = EXCLUDED.time_allocation,
  updated_at = CURRENT_TIMESTAMP
```

## 🔧 开发命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器

# 数据库
npm run setup-db     # 初始化数据库表
npm run check-schema # 检查数据库架构

# 代码质量
npm run lint         # ESLint 检查
```

## 🤔 常见问题

### Q: 如何添加新的时间分配字段？

编辑 `src/lib/constants.ts`：

```typescript
{ key: 'new_field', label: '新字段名称' }
```

推送代码即可，**无需修改数据库**！

### Q: 如何修改小组选项？

编辑 `src/lib/constants.ts` 中的 `TEAM_OPTIONS` 数组。

### Q: 本地如何连接数据库？

```bash
vercel env pull .env.local  # 从 Vercel 拉取环境变量
npm run check-schema        # 检查数据库连接
```

## 📚 文档

详细文档请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔗 相关链接

- **GitHub**: https://github.com/qso/server-sdd-question
- **Vercel Dashboard**: https://vercel.com/qsos-projects/server-sdd-question

---

**最后更新**: 2026-01-27
**当前架构**: JSON 存储（简化架构）
**数据库**: Neon Serverless Postgres
