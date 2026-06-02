import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { StateElection, ElectionResult } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const stateElections = await StateElection.find({}).sort({ year: 1, stateName: 1 });
    const electionResults = await ElectionResult.find({});
    return NextResponse.json({ stateElections, electionResults }, { status: 200 });
  } catch (error) {
    console.error('Error fetching state elections data:', error);
    return NextResponse.json({ error: 'Failed to fetch state elections data' }, { status: 500 });
  }
}
