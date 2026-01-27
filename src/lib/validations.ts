import { z } from 'zod';

export const surveySchema = z.object({
  name: z.string().min(1, "姓名不能为空").max(255),
  team: z.string().min(1, "小组不能为空").max(255),

  // Development Process fields
  requirement_analysis: z.number().min(0).max(100),
  requirement_output: z.number().min(0).max(100),
  requirement_review: z.number().min(0).max(100),
  task_breakdown: z.number().min(0).max(100),
  technical_proposal_output: z.number().min(0).max(100),
  technical_proposal_review: z.number().min(0).max(100),
  test_case_output: z.number().min(0).max(100),
  test_case_review: z.number().min(0).max(100),
  code_development: z.number().min(0).max(100),
  feature_integration: z.number().min(0).max(100),
  smoke_testing: z.number().min(0).max(100),
  functional_testing: z.number().min(0).max(100),
  bugfix: z.number().min(0).max(100),
  code_review: z.number().min(0).max(100),
  feature_launch: z.number().min(0).max(100),

  // Daily Tasks fields
  alert_management: z.number().min(0).max(100),
  exception_logs: z.number().min(0).max(100),
  daily_qa: z.number().min(0).max(100),
  public_opinion: z.number().min(0).max(100),
  meetings: z.number().min(0).max(100),
  online_emergency: z.number().min(0).max(100),
}).refine((data) => {
  const sum = Object.entries(data)
    .filter(([key]) => key !== 'name' && key !== 'team')
    .reduce((acc, [_, value]) => acc + (value as number), 0);
  return Math.abs(sum - 100) < 0.01;
}, {
  message: "所有时间分配必须总和为100%"
});

export type SurveyData = z.infer<typeof surveySchema>;
