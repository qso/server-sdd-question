import { z } from 'zod';

export const surveySchema = z.object({
  name: z.string().min(1, "姓名不能为空").max(255),
  team: z.string().min(1, "小组不能为空").max(255),
  time_allocation: z.record(z.string(), z.number().min(0).max(100))
});

export type SurveyData = z.infer<typeof surveySchema>;
