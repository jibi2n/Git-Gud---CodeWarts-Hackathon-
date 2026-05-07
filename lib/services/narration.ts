import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import type { Child, CaseNote, Prediction } from '../types';
import { CASE_NOTE_SYSTEM_PROMPT, buildCaseNotePrompt, buildFallbackCaseNote } from '../prompts';
import { DEMO_CHILD_IDS } from '../constants';

let narrationsCache: Record<string, CaseNote> | null = null;

function loadNarrations(): Record<string, CaseNote> {
  if (narrationsCache) return narrationsCache;
  const filePath = join(process.cwd(), 'data', 'precomputed_narrations.json');
  const raw = readFileSync(filePath, 'utf-8');
  narrationsCache = JSON.parse(raw) as Record<string, CaseNote>;
  return narrationsCache;
}

export class NarrationService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.client;
  }

  async narrate(child: Child, prediction: Prediction): Promise<CaseNote> {
    const isDemoMode = process.env.DEMO_MODE === 'true';
    const isDemoChild = DEMO_CHILD_IDS.includes(child.id);

    if (isDemoMode && isDemoChild) {
      const narrations = loadNarrations();
      const cached = narrations[child.id];
      if (cached) {
        return { ...cached, source: 'cached' };
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        childId: child.id,
        narrativeText: buildFallbackCaseNote(child, prediction),
        generatedAt: new Date().toISOString(),
        source: 'cached',
      };
    }

    try {
      const openai = this.getClient();
      const prompt = buildCaseNotePrompt(child, prediction);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 400,
        messages: [
          { role: 'system', content: CASE_NOTE_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      });

      const text = response.choices[0]?.message?.content ?? '';

      return {
        childId: child.id,
        narrativeText: text.trim(),
        generatedAt: new Date().toISOString(),
        source: 'live',
      };
    } catch {
      return {
        childId: child.id,
        narrativeText: buildFallbackCaseNote(child, prediction),
        generatedAt: new Date().toISOString(),
        source: 'cached',
      };
    }
  }
}

export const narrationService = new NarrationService();
