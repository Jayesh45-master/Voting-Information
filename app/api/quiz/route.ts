import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { QuizQuestion } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const questions = await QuizQuestion.find({});
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json({ error: 'Internal server error while fetching quiz' }, { status: 500 });
  }
}
