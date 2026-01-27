import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// 加载 .env.local 文件
config({ path: '.env.local' });

async function checkSchema() {
  try {
    console.log('🔍 检查表结构...\n');

    // 检查表是否存在
    const tableCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'survey_responses'
    `;

    if (tableCheck.rows.length === 0) {
      console.log('❌ 表 survey_responses 不存在');
      console.log('💡 运行 npm run setup-db 创建表');
      return;
    }

    console.log('✅ 表 survey_responses 存在\n');

    // 检查列结构
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'survey_responses'
      ORDER BY ordinal_position
    `;

    console.log('📋 当前表结构:');
    columns.rows.forEach((col: any) => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  - ${col.column_name}: ${col.data_type}${length}`);
    });

    // 检查是否有 time_allocation 字段
    const hasTimeAllocation = columns.rows.some((col: any) => col.column_name === 'time_allocation');
    const hasOldFields = columns.rows.some((col: any) => col.column_name === 'requirement_analysis');

    console.log('\n架构检查:');
    if (hasTimeAllocation && !hasOldFields) {
      console.log('✅ 使用新架构 (JSON存储)');
    } else if (hasOldFields && !hasTimeAllocation) {
      console.log('⚠️  使用旧架构 (21个独立列)');
      console.log('💡 运行 npx tsx scripts/migrate-to-json-schema.ts 迁移到新架构');
    } else if (hasTimeAllocation && hasOldFields) {
      console.log('⚠️  同时存在新旧字段，架构混乱');
      console.log('💡 建议备份数据后重建表');
    } else {
      console.log('❓ 未知架构状态');
    }

    // 检查数据量
    const count = await sql`SELECT COUNT(*) as count FROM survey_responses`;
    console.log(`\n📊 当前数据量: ${count.rows[0].count} 条记录`);

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkSchema();
