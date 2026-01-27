'use server';

import { revalidatePath } from 'next/cache';
import { surveySchema, SurveyData } from './validations';
import { createSurveyResponse } from './db';

export async function submitSurvey(formData: SurveyData) {
  try {
    const validatedData = surveySchema.parse(formData);
    const result = await createSurveyResponse(validatedData);

    revalidatePath('/admin');

    return {
      success: true,
      message: '提交成功!',
      data: result
    };
  } catch (error) {
    console.error('Survey submission error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '提交失败，请重试'
    };
  }
}
