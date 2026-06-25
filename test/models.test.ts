// Unit test: every curated model must actually be shipped by the installed
// @mlc-ai/web-llm. Guards the allow-list in src/lib/ai/models.ts from drifting
// out of sync with the WebLLM build (a missing id would silently vanish from the
// model picker). No browser/Postgres needed — this reads the prebuilt config only.
import { describe, expect, it } from 'vitest';
import { prebuiltAppConfig } from '@mlc-ai/web-llm';
import { PREFERRED_MODELS, curatedOptions, type ModelEntry } from '../src/lib/ai/models';

const available = new Set(prebuiltAppConfig.model_list.map((m) => m.model_id));

describe('curated WebLLM models', () => {
	it('has a non-empty allow-list', () => {
		expect(PREFERRED_MODELS.length).toBeGreaterThan(0);
	});

	it.each(PREFERRED_MODELS)('is shipped by web-llm: %s', (id) => {
		expect(available.has(id)).toBe(true);
	});

	it.each(PREFERRED_MODELS)('exposes a vram footprint: %s', (id) => {
		const entry = prebuiltAppConfig.model_list.find((m) => m.model_id === id);
		expect(entry?.vram_required_MB).toBeGreaterThan(0);
	});

	it('curatedOptions surfaces every available curated model', () => {
		const options = curatedOptions(prebuiltAppConfig.model_list as ModelEntry[], null);
		expect(options.map((o) => o.id)).toEqual(PREFERRED_MODELS);
	});
});
