import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { QuizQuestion } from '@/lib/models';

export const dynamic = 'force-dynamic';

const QUESTIONS_PER_QUIZ = 5;

export async function GET() {
  try {
    await dbConnect();

    // Use MongoDB $sample aggregation to get N random questions every call
    // This ensures every page visit and every user gets a different set
    const questions = await QuizQuestion.aggregate([
      { $sample: { size: QUESTIONS_PER_QUIZ } }
    ]);

    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    // Fallback: if DB has fewer than 5 questions, return all in shuffled order
    if (!questions || questions.length === 0) {
      const all = await QuizQuestion.find({});
      const shuffled = all.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_QUIZ);
      return NextResponse.json(shuffled, { status: 200, headers });
    }

    return NextResponse.json(questions, { status: 200, headers });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json({ error: 'Internal server error while fetching quiz' }, { status: 500 });
  }
}
