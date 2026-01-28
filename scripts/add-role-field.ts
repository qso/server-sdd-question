import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// 加载 .env.local 文件
config({ path: '.env.local' });

async function addRoleField() {
  try {
    console.log('🔧 Adding role field to survey_responses table...');

    // 添加 role 字段，默认值为 'server'
    await sql`
      ALTER TABLE survey_responses
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'server'
    `;
    console.log('✅ Added role field with default value "server"');

    // 创建索引以提高查询性能
    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_role ON survey_responses(role)`;
    console.log('✅ Created index: idx_survey_responses_role');

    console.log('✅ Migration complete!');
    console.log('\n更新后的表结构:');
    console.log('- id: 主键');
    console.log('- name: 姓名 (唯一索引)');
    console.log('- team: 小组 (索引)');
    console.log('- role: 职能 (索引, 默认值: server)');
    console.log('- time_allocation: 时间分配 JSON (TEXT)');
    console.log('- created_at: 创建时间');
    console.log('- updated_at: 更新时间');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // 关闭连接
    process.exit(0);
  }
}

addRoleField();
