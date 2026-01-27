import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// 加载 .env.local 文件
config({ path: '.env.local' });

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

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
    console.log('✅ Created table: survey_responses');

    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_name ON survey_responses(name)`;
    console.log('✅ Created index: idx_survey_responses_name');

    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_team ON survey_responses(team)`;
    console.log('✅ Created index: idx_survey_responses_team');

    console.log('✅ Database setup complete!');
    console.log('\n表结构:');
    console.log('- id: 主键');
    console.log('- name: 姓名 (唯一索引)');
    console.log('- team: 小组 (索引)');
    console.log('- time_allocation: 时间分配 JSON (TEXT)');
    console.log('- created_at: 创建时间');
    console.log('- updated_at: 更新时间');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

setupDatabase();
