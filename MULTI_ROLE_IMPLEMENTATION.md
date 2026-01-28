# 多职能问卷功能实现总结

## 数据库迁移 SQL

请在远程数据库执行以下 SQL 语句：

```sql
-- 添加 role 字段，默认值为 'server'（用于兼容已有数据）
ALTER TABLE survey_responses
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'server';

-- 创建索引以提高查询性能
CREATE INDEX idx_survey_responses_role ON survey_responses(role);

-- 注释说明：role 字段可选值为 'server'（服务端）、'frontend'（大前端）、'qa'（QA）
```

## 主要修改内容

### 1. 常量配置 (src/lib/constants.ts)
- 新增职能类型定义：`ROLE_TYPES` 和 `ROLE_OPTIONS`
- 添加服务端配置：`SERVER_CATEGORIES`、`SERVER_TEAMS`
- 添加大前端配置：`FRONTEND_CATEGORIES`、`FRONTEND_TEAMS`
  - 16个研发流程字段（含需求沟通、编译打包、代码合入）
  - 7个日常事项字段
  - 6个团队选项
- 添加QA配置：`QA_CATEGORIES`、`QA_TEAMS`
  - 11个研发流程字段
  - 13个日常事项字段
  - 5个团队选项
- 新增辅助函数：`getCategoriesByRole()`、`getTeamsByRole()`

### 2. 数据验证 (src/lib/validations.ts)
- 在 `surveySchema` 中添加 `role` 字段，默认值为 'server'

### 3. 数据库操作 (src/lib/db.ts)
- 更新 `createSurveyResponse()` 函数，支持保存和更新 role 字段

### 4. 问卷表单 (src/components/survey/SurveyForm.tsx)
- 添加职能选择下拉框（第一个字段）
- 根据选择的职能动态加载对应的团队选项和问卷字段
- 当职能切换时自动重置表单数据
- 提交时包含 role 字段

### 5. 首页标题 (src/app/page.tsx)
- 将标题从"服务端开发 AI 研发提效问卷"改为"AI 研发提效问卷"

### 6. 结果页面 (src/app/results/page.tsx)
- 添加职能TAB切换组件（服务端、大前端、QA）
- 数据按职能过滤显示
- 所有统计数据、图表、小组统计都基于当前选中的职能
- 问卷详情展开显示对应职能的字段

### 7. UI组件
- 新建 Dialog 组件 (src/components/ui/dialog.tsx)
- 新建 Tabs 组件 (src/components/ui/tabs.tsx)
- 安装依赖：`@radix-ui/react-dialog`、`@radix-ui/react-tabs`

## 功能特性

1. **多职能支持**：系统现在支持服务端、大前端、QA三种职能
2. **动态表单**：根据选择的职能动态显示不同的团队和问卷字段
3. **数据隔离**：结果页面按职能TAB分别显示，互不干扰
4. **向后兼容**：已有的服务端数据会自动标记为 role='server'
5. **完整统计**：每个职能都有独立的统计数据、图表和小组分析

## 职能配置详情

### 服务端（11个团队）
- 13个研发流程字段 + 8个日常事项字段

### 大前端（6个团队）
- 16个研发流程字段（新增：需求沟通、编译打包、代码合入）
- 7个日常事项字段

### QA（5个团队）
- 11个研发流程字段（含需求评审&澄清、线上质量保障等）
- 13个日常事项字段（含自动化维护、效率工具研发、专项等）

## 注意事项

1. 数据库迁移需要在远程执行，本地开发已准备好迁移脚本
2. 所有已有数据会自动标记为 'server' 职能
3. 新提交的问卷必须选择职能才能提交
4. 结果页面默认显示服务端TAB，可以切换查看其他职能的数据
