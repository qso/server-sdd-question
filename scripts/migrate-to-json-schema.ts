import { sql } from '@vercel/postgres';

/**
 * 数据库迁移脚本：从独立列迁移到JSON存储
 *
 * 运行方式: npx tsx scripts/migrate-to-json-schema.ts
 */

async function migrateToJsonSchema() {
  try {
    console.log('🔧 开始迁移数据库架构...');

    // 检查旧表是否存在
    const tableCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'survey_responses'
    `;

    if (tableCheck.rows.length === 0) {
      console.log('ℹ️  表不存在，直接创建新表结构');
      await createNewTable();
      return;
    }

    // 检查是否已经是新表结构
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'survey_responses'
      AND column_name = 'time_allocation'
    `;

    if (columnCheck.rows.length > 0) {
      console.log('✅ 表已经是新结构，无需迁移');
      return;
    }

    console.log('📋 检测到旧表结构，开始迁移数据...');

    // 1. 创建临时新表
    await sql`
      CREATE TABLE IF NOT EXISTS survey_responses_new (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        team VARCHAR(255) NOT NULL,
        time_allocation TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ 创建临时新表');

    // 2. 从旧表读取数据
    const oldData = await sql`SELECT * FROM survey_responses`;
    console.log(`📊 找到 ${oldData.rows.length} 条数据需要迁移`);

    // 3. 转换并插入数据到新表
    for (const row of oldData.rows) {
      const timeAllocation = {
        requirement_analysis: row.requirement_analysis || 0,
        requirement_output: row.requirement_output || 0,
        requirement_review: row.requirement_review || 0,
        task_breakdown: row.task_breakdown || 0,
        technical_proposal_output: row.technical_proposal_output || 0,
        technical_proposal_review: row.technical_proposal_review || 0,
        test_case_output: row.test_case_output || 0,
        test_case_review: row.test_case_review || 0,
        code_development: row.code_development || 0,
        feature_integration: row.feature_integration || 0,
        smoke_testing: row.smoke_testing || 0,
        functional_testing: row.functional_testing || 0,
        bugfix: row.bugfix || 0,
        code_review: row.code_review || 0,
        feature_launch: row.feature_launch || 0,
        alert_management: row.alert_management || 0,
        exception_logs: row.exception_logs || 0,
        daily_qa: row.daily_qa || 0,
        public_opinion: row.public_opinion || 0,
        meetings: row.meetings || 0,
        online_emergency: row.online_emergency || 0,
      };

      const timeAllocationJson = JSON.stringify(timeAllocation);

      await sql`
        INSERT INTO survey_responses_new (name, team, time_allocation, created_at, updated_at)
        VALUES (
          ${row.name},
          ${row.team},
          ${timeAllocationJson},
          ${row.created_at},
          ${row.updated_at}
        )
      `;
    }
    console.log('✅ 数据迁移完成');

    // 4. 删除旧表
    await sql`DROP TABLE survey_responses`;
    console.log('✅ 删除旧表');

    // 5. 重命名新表
    await sql`ALTER TABLE survey_responses_new RENAME TO survey_responses`;
    console.log('✅ 重命名新表');

    // 6. 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_name ON survey_responses(name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_team ON survey_responses(team)`;
    console.log('✅ 创建索引');

    console.log('✅ 数据库迁移完成!');
    console.log('\n新表结构:');
    console.log('- id: 主键');
    console.log('- name: 姓名 (唯一索引)');
    console.log('- team: 小组 (索引)');
    console.log('- time_allocation: 时间分配 JSON (TEXT)');
    console.log('- created_at: 创建时间');
    console.log('- updated_at: 更新时间');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  }
}

async function createNewTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      team VARCHAR(255) NOT NULL,
      time_allocation TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('✅ 创建表: survey_responses');

  await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_name ON survey_responses(name)`;
  console.log('✅ 创建索引: idx_survey_responses_name');

  await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_team ON survey_responses(team)`;
  console.log('✅ 创建索引: idx_survey_responses_team');

  console.log('✅ 数据库初始化完成!');
}

migrateToJsonSchema();
