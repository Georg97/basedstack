/**
 * Curated WebLLM model selection for the on-device chat.
 *
 * One quality-ordered allow-list (best first) — the chat only ever offers models
 * from here, so generation quality stays predictable. The Qwen3.5 generation leads
 * (strong and compact), Ministral-3 is a capable mid alternative, and gemma3-1b is
 * the compact floor for constrained / mobile GPUs. Deliberately no Llama or Qwen2.x:
 * both are dated and outclassed by everything here. Adapted from skol-cloud.
 *
 * Ids are resolved against WebLLM's `prebuiltAppConfig` at runtime, so any id the
 * installed web-llm version doesn't ship is silently skipped.
 */
export const PREFERRED_MODELS = [
	'Qwen3.5-9B-q4f16_1-MLC',
	'Qwen3.5-4B-q4f16_1-MLC',
	'Ministral-3-3B-Instruct-2512-BF16-q4f16_1-MLC',
	'Qwen3.5-2B-q4f16_1-MLC',
	'Qwen3.5-0.8B-q4f16_1-MLC',
	'gemma3-1b-it-q4f16_1-MLC'
];

/** The subset of a WebLLM model record we reason about. */
export interface ModelEntry {
	model_id: string;
	required_features?: string[];
	vram_required_MB?: number;
}

/** What we read off the live GPUAdapter. */
export interface AdapterInfo {
	features: Set<string>;
	maxStorageBufferBindingSize: number;
	maxBufferSize: number;
}

/** A curated model offered in the UI. */
export interface ModelOption {
	id: string;
	label: string;
	vramMB: number;
	/** Fits this device's GPU budget. Still selectable if false — just risky. */
	fits: boolean;
}

/** Mobile GPUs typically cap storage-buffer bindings at 128–256 MiB. */
const TIGHT_BINDING_BYTES = 256 * 1024 * 1024;
/** A roomy max buffer size marks a discrete / Apple-Silicon-class GPU. */
const ROOMY_BUFFER_BYTES = 3.5 * 1024 * 1024 * 1024;
const MOBILE_BUDGET_MB = 1200;
const DESKTOP_BUDGET_MB = 4096;
const HIGH_END_BUDGET_MB = 6600;

/** The footprint budget (MB) this adapter's tier allows. */
function budgetFor(adapter: AdapterInfo): number {
	if (adapter.maxStorageBufferBindingSize <= TIGHT_BINDING_BYTES) return MOBILE_BUDGET_MB;
	if (adapter.maxBufferSize >= ROOMY_BUFFER_BYTES) return HIGH_END_BUDGET_MB;
	return DESKTOP_BUDGET_MB;
}

/** Whether a model fits the adapter: required features met and within the budget. */
export function modelFits(adapter: AdapterInfo, m: ModelEntry): boolean {
	const required = m.required_features ?? [];
	if (required.some((f) => !adapter.features.has(f))) return false;
	return (m.vram_required_MB ?? 0) <= budgetFor(adapter);
}

/** Friendly label, e.g. "Qwen3.5-9B-q4f16_1-MLC" -> "Qwen3.5 9B". */
export function prettyLabel(id: string): string {
	return id
		.replace(/-q[0-9]f[0-9_]+/i, '')
		.replace(/-BF16/i, '')
		.replace(/-Instruct.*$/i, '')
		.replace(/-it\b/i, '')
		.replace(/-MLC$/i, '')
		.replace(/-/g, ' ')
		.trim();
}

/** Human size for a VRAM footprint in MB. */
export function formatSize(vramMB: number): string {
	return vramMB >= 1024 ? `${(vramMB / 1024).toFixed(1)} GB` : `${Math.round(vramMB)} MB`;
}

/**
 * Build the curated option list from WebLLM's `model_list`, best first. Only ids in
 * PREFERRED_MODELS that the installed config actually ships are kept; `fits` is
 * computed from the live adapter when one is available.
 */
export function curatedOptions(models: ModelEntry[], adapter: AdapterInfo | null): ModelOption[] {
	const out: ModelOption[] = [];
	for (const id of PREFERRED_MODELS) {
		const m = models.find((x) => x.model_id === id);
		if (!m) continue;
		out.push({
			id,
			label: prettyLabel(id),
			vramMB: m.vram_required_MB ?? 0,
			fits: adapter ? modelFits(adapter, m) : true
		});
	}
	return out;
}

/** The best curated model that fits, else the smallest curated one as a fallback. */
export function recommendedModel(options: ModelOption[]): string | null {
	if (!options.length) return null;
	return (options.find((o) => o.fits) ?? options[options.length - 1]).id;
}
