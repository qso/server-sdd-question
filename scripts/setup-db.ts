import { sql } from '@vercel/postgres';

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    await sql`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        team VARCHAR(255) NOT NULL,
        requirement_analysis DECIMAL(5,2) NOT NULL DEFAULT 0,
        requirement_output DECIMAL(5,2) NOT NULL DEFAULT 0,
        requirement_review DECIMAL(5,2) NOT NULL DEFAULT 0,
        task_breakdown DECIMAL(5,2) NOT NULL DEFAULT 0,
        technical_proposal_output DECIMAL(5,2) NOT NULL DEFAULT 0,
        technical_proposal_review DECIMAL(5,2) NOT NULL DEFAULT 0,
        test_case_output DECIMAL(5,2) NOT NULL DEFAULT 0,
        test_case_review DECIMAL(5,2) NOT NULL DEFAULT 0,
        code_development DECIMAL(5,2) NOT NULL DEFAULT 0,
        feature_integration DECIMAL(5,2) NOT NULL DEFAULT 0,
        smoke_testing DECIMAL(5,2) NOT NULL DEFAULT 0,
        functional_testing DECIMAL(5,2) NOT NULL DEFAULT 0,
        bugfix DECIMAL(5,2) NOT NULL DEFAULT 0,
        code_review DECIMAL(5,2) NOT NULL DEFAULT 0,
        feature_launch DECIMAL(5,2) NOT NULL DEFAULT 0,
        alert_management DECIMAL(5,2) NOT NULL DEFAULT 0,
        exception_logs DECIMAL(5,2) NOT NULL DEFAULT 0,
        daily_qa DECIMAL(5,2) NOT NULL DEFAULT 0,
        public_opinion DECIMAL(5,2) NOT NULL DEFAULT 0,
        meetings DECIMAL(5,2) NOT NULL DEFAULT 0,
        online_emergency DECIMAL(5,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_total_sum CHECK (
          requirement_analysis + requirement_output + requirement_review +
          task_breakdown + technical_proposal_output + technical_proposal_review +
          test_case_output + test_case_review + code_development +
          feature_integration + smoke_testing + functional_testing +
          bugfix + code_review + feature_launch +
          alert_management + exception_logs + daily_qa + public_opinion +
          meetings + online_emergency = 100
        )
      )
    `;
    console.log('✅ Created table: survey_responses');

    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_name ON survey_responses(name)`;
    console.log('✅ Created index: idx_survey_responses_name');

    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_team ON survey_responses(team)`;
    console.log('✅ Created index: idx_survey_responses_team');

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

setupDatabase();
