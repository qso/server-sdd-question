import { sql } from '@vercel/postgres';

/**
 * 数据库迁移脚本：去掉 experience_orders 字段
 *
 * 运行方式: npx tsx scripts/migrate-remove-experience-orders.ts
 */

async function migrateDatabase() {
  try {
    console.log('🔧 开始迁移数据库...');

    // 检查列是否存在
    const checkColumn = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'survey_responses'
      AND column_name = 'experience_orders'
    `;

    if (checkColumn.rows.length === 0) {
      console.log('✅ experience_orders 列不存在，无需迁移');
      return;
    }

    console.log('📋 找到 experience_orders 列，开始删除...');

    // 1. 先删除旧的约束
    await sql`
      ALTER TABLE survey_responses
      DROP CONSTRAINT IF EXISTS check_total_sum
    `;
    console.log('✅ 已删除旧的 check_total_sum 约束');

    // 2. 删除 experience_orders 列
    await sql`
      ALTER TABLE survey_responses
      DROP COLUMN IF EXISTS experience_orders
    `;
    console.log('✅ 已删除 experience_orders 列');

    // 3. 添加新的约束（不包含 experience_orders）
    await sql`
      ALTER TABLE survey_responses
      ADD CONSTRAINT check_total_sum CHECK (
        requirement_analysis + requirement_output + requirement_review +
        task_breakdown + technical_proposal_output + technical_proposal_review +
        test_case_output + test_case_review + code_development +
        feature_integration + smoke_testing + functional_testing +
        bugfix + code_review + feature_launch +
        alert_management + exception_logs + daily_qa + public_opinion +
        meetings + online_emergency = 100
      )
    `;
    console.log('✅ 已添加新的 check_total_sum 约束');

    console.log('✅ 数据库迁移完成!');
    console.log('\n注意事项:');
    console.log('- experience_orders 列已被删除');
    console.log('- 现在共有 21 个字段 (15个研发流程 + 6个日常事项)');
    console.log('- 所有字段总和必须等于 100%');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  }
}

migrateDatabase();
