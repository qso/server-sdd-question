import { sql } from '@vercel/postgres';
import { SurveyData } from './validations';

export async function createSurveyResponse(data: SurveyData) {
  const timeAllocationJson = JSON.stringify(data.time_allocation);
  const role = data.role || 'server';

  const result = await sql`
    INSERT INTO survey_responses (name, team, role, time_allocation)
    VALUES (${data.name}, ${data.team}, ${role}, ${timeAllocationJson})
    ON CONFLICT (name)
    DO UPDATE SET
      team = EXCLUDED.team,
      role = EXCLUDED.role,
      time_allocation = EXCLUDED.time_allocation,
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
    SELECT COUNT(*) as total_responses
    FROM survey_responses;
  `;
  return result.rows[0];
}
