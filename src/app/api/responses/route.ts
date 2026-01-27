import { NextResponse } from 'next/server';
import { getAllSurveyResponses } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const responses = await getAllSurveyResponses();
    return NextResponse.json(responses);
  } catch (error) {
    console.error('Failed to fetch responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
