import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { QuizQuestion } from '@/lib/models';

const QUESTIONS_PER_QUIZ = 5;

export async function GET() {
  try {
    await dbConnect();

    // Use MongoDB $sample aggregation to get N random questions every call
    // This ensures every page visit and every user gets a different set
    const questions = await QuizQuestion.aggregate([
      { $sample: { size: QUESTIONS_PER_QUIZ } }
    ]);

    // Fallback: if DB has fewer than 5 questions, return all in shuffled order
    if (!questions || questions.length === 0) {
      const all = await QuizQuestion.find({});
      const shuffled = all.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_QUIZ);
      return NextResponse.json(shuffled, { status: 200 });
    }

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json({ error: 'Internal server error while fetching quiz' }, { status: 500 });
  }
}
