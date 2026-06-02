import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VotingStep } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const steps = await VotingStep.find({}).sort({ stepNumber: 1 });
    return NextResponse.json(steps, { status: 200 });
  } catch (error) {
    console.error('Error fetching voting steps:', error);
    return NextResponse.json({ error: 'Failed to fetch voting steps' }, { status: 500 });
  }
}
