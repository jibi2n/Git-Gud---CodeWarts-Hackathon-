import { NextResponse, type NextRequest } from 'next/server';
import { caseloadService } from '@/lib/services/caseload';
import { predictionService } from '@/lib/services/prediction';
import { narrationService } from '@/lib/services/narration';
import { interventionService } from '@/lib/services/intervention';
import { accessControlService } from '@/lib/services/accessControl';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const child = caseloadService.getChildById(id);
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const prediction = predictionService.getPrediction(id);
    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    accessControlService.audit('Marivic Santos', 'Municipal Link', id);

    const [caseNote, interventions] = await Promise.all([
      narrationService.narrate(child, prediction),
      Promise.resolve(interventionService.recommend(prediction)),
    ]);

    const accessAuditLog = [
      {
        accessedBy: 'Marivic Santos',
        role: 'Municipal Link',
        timestamp: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      child,
      prediction,
      caseNote,
      interventions,
      accessAuditLog,
    });
  } catch (error) {
    console.error(`Child detail API error for ${id}:`, error);
    return NextResponse.json({ error: 'Failed to load child detail' }, { status: 500 });
  }
}
