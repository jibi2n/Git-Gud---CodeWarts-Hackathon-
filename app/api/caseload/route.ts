import { NextResponse } from 'next/server';
import { caseloadService } from '@/lib/services/caseload';
import { predictionService } from '@/lib/services/prediction';
import { SOCIAL_WORKER } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const children = caseloadService.getFlaggedChildren();
    const summary = predictionService.getSummary();

    return NextResponse.json({
      socialWorker: SOCIAL_WORKER,
      children,
      summary,
    });
  } catch (error) {
    console.error('Caseload API error:', error);
    return NextResponse.json({ error: 'Failed to load caseload' }, { status: 500 });
  }
}
