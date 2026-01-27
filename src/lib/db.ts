import { sql } from '@vercel/postgres';
import { SurveyData } from './validations';

export async function createSurveyResponse(data: SurveyData) {
  const result = await sql`
    INSERT INTO survey_responses (
      name, team,
      requirement_analysis, requirement_output, requirement_review,
      task_breakdown, technical_proposal_output, technical_proposal_review,
      test_case_output, test_case_review, code_development,
      feature_integration, smoke_testing, functional_testing,
      bugfix, code_review, feature_launch,
      alert_management, exception_logs, daily_qa, public_opinion,
      meetings, online_emergency
    ) VALUES (
      ${data.name}, ${data.team},
      ${data.requirement_analysis}, ${data.requirement_output}, ${data.requirement_review},
      ${data.task_breakdown}, ${data.technical_proposal_output}, ${data.technical_proposal_review},
      ${data.test_case_output}, ${data.test_case_review}, ${data.code_development},
      ${data.feature_integration}, ${data.smoke_testing}, ${data.functional_testing},
      ${data.bugfix}, ${data.code_review}, ${data.feature_launch},
      ${data.alert_management}, ${data.exception_logs}, ${data.daily_qa}, ${data.public_opinion},
      ${data.meetings}, ${data.online_emergency}
    )
    ON CONFLICT (name)
    DO UPDATE SET
      team = EXCLUDED.team,
      requirement_analysis = EXCLUDED.requirement_analysis,
      requirement_output = EXCLUDED.requirement_output,
      requirement_review = EXCLUDED.requirement_review,
      task_breakdown = EXCLUDED.task_breakdown,
      technical_proposal_output = EXCLUDED.technical_proposal_output,
      technical_proposal_review = EXCLUDED.technical_proposal_review,
      test_case_output = EXCLUDED.test_case_output,
      test_case_review = EXCLUDED.test_case_review,
      code_development = EXCLUDED.code_development,
      feature_integration = EXCLUDED.feature_integration,
      smoke_testing = EXCLUDED.smoke_testing,
      functional_testing = EXCLUDED.functional_testing,
      bugfix = EXCLUDED.bugfix,
      code_review = EXCLUDED.code_review,
      feature_launch = EXCLUDED.feature_launch,
      alert_management = EXCLUDED.alert_management,
      exception_logs = EXCLUDED.exception_logs,
      daily_qa = EXCLUDED.daily_qa,
      public_opinion = EXCLUDED.public_opinion,
      meetings = EXCLUDED.meetings,
      online_emergency = EXCLUDED.online_emergency,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  return result.rows[0];
}

export async function getAllSurveyResponses() {
  const result = await sql`
    SELECT * FROM survey_responses
    ORDER BY updated_at DESC;
  `;
  return result.rows;
}

export async function getSurveyStats() {
  const result = await sql`
    SELECT
      COUNT(*) as total_responses,
      AVG(
        requirement_analysis + requirement_output + requirement_review +
        task_breakdown + technical_proposal_output + technical_proposal_review +
        test_case_output + test_case_review + code_development +
        feature_integration + smoke_testing + functional_testing +
        bugfix + code_review + feature_launch
      ) as avg_dev_process,
      AVG(
        alert_management + exception_logs + daily_qa + public_opinion +
        meetings + online_emergency
      ) as avg_daily_tasks
    FROM survey_responses;
  `;
  return result.rows[0];
}
