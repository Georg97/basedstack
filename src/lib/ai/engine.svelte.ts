import { browser } from '$app/environment';
import type { MLCEngineInterface, ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import {
	curatedOptions,
	recommendedModel,
	type AdapterInfo,
	type ModelEntry,
	type ModelOption
} from './models';

/**
 * The on-device chat engine: one reactive singleton that detects WebGPU, lists the
 * curated models, downloads/loads the chosen one into a Web Worker, and streams chat
 * replies. WebLLM is dynamically imported so its heavy bundle is code-split and the
 * server build never pulls it in. Everything runs in the browser — no prompt or reply
 * ever leaves the device.
 */

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export type AiPhase =
	| 'unknown' // before init()
	| 'unsupported' // no usable WebGPU
	| 'idle' // models listed, nothing loaded
	| 'loading' // downloading / initialising a model
	| 'ready' // model loaded, can chat
	| 'generating' // a reply is streaming
	| 'error';

export const ai = $state({
	phase: 'unknown' as AiPhase,
	models: [] as ModelOption[],
	selectedModel: '',
	activeModel: '',
	progress: 0,
	progressText: '',
	error: '',
	messages: [] as ChatMessage[]
});

let engine: MLCEngineInterface | null = null;
let worker: Worker | null = null;

const SYSTEM_PROMPT =
	"You are a helpful assistant running entirely on the user's device. Be concise and friendly.";

interface GpuLike {
	requestAdapter(): Promise<{
		features: Iterable<string>;
		limits: { maxStorageBufferBindingSize: number; maxBufferSize: number };
	} | null>;
}

/** Read the live adapter's features + limits, or null if WebGPU is unusable. */
async function readAdapter(): Promise<AdapterInfo | null> {
	const gpu = (navigator as Navigator & { gpu?: GpuLike }).gpu;
	if (!gpu) return null;
	try {
		const adapter = await gpu.requestAdapter();
		if (!adapter) return null;
		return {
			features: new Set(adapter.features),
			maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
			maxBufferSize: adapter.limits.maxBufferSize
		};
	} catch {
		return null;
	}
}

function errMsg(e: unknown): string {
	return e instanceof Error ? e.message : String(e);
}

/** Detect WebGPU and build the curated model list. Safe to call repeatedly. */
export async function init(): Promise<void> {
	if (!browser || ai.phase !== 'unknown') return;
	const adapter = await readAdapter();
	if (!adapter) {
		ai.phase = 'unsupported';
		return;
	}
	const { prebuiltAppConfig } = await import('@mlc-ai/web-llm');
	const options = curatedOptions(prebuiltAppConfig.model_list as ModelEntry[], adapter);
	if (!options.length) {
		ai.phase = 'unsupported';
		ai.error = 'No compatible on-device model is available in this browser.';
		return;
	}
	ai.models = options;
	ai.selectedModel = recommendedModel(options) ?? options[0].id;
	ai.phase = 'idle';
}

/** Download + load the given model into a fresh worker. */
export async function load(modelId: string): Promise<void> {
	if (!browser || !modelId) return;
	ai.phase = 'loading';
	ai.error = '';
	ai.progress = 0;
	ai.progressText = '';
	try {
		const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
		// Swap models cleanly: drop any previous worker/engine first.
		if (worker) {
			worker.terminate();
			worker = null;
			engine = null;
		}
		worker = new Worker(new URL('./webllm.worker.ts', import.meta.url), { type: 'module' });
		engine = await CreateWebWorkerMLCEngine(worker, modelId, {
			initProgressCallback: (report) => {
				ai.progress = report.progress;
				ai.progressText = report.text;
			}
		});
		ai.activeModel = modelId;
		ai.messages = [];
		ai.phase = 'ready';
	} catch (e) {
		ai.phase = 'error';
		ai.error = errMsg(e);
		if (worker) {
			worker.terminate();
			worker = null;
		}
		engine = null;
	}
}

/** Send a user message and stream the assistant reply into `ai.messages`. */
export async function send(text: string): Promise<void> {
	const content = text.trim();
	if (!content || !engine || ai.phase !== 'ready') return;

	ai.messages.push({ role: 'user', content });
	ai.messages.push({ role: 'assistant', content: '' });
	const replyIndex = ai.messages.length - 1;
	ai.phase = 'generating';

	try {
		const history = ai.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
		const chunks = await engine.chat.completions.create({
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				...history
			] as ChatCompletionMessageParam[],
			stream: true,
			temperature: 0.7,
			max_tokens: 1024
		});
		for await (const chunk of chunks) {
			const delta = chunk.choices[0]?.delta?.content ?? '';
			if (delta) ai.messages[replyIndex].content += delta;
		}
	} catch (e) {
		ai.messages[replyIndex].content ||= `⚠ ${errMsg(e)}`;
	} finally {
		ai.phase = 'ready';
	}
}

/** Clear the conversation (keeps the loaded model). */
export function clearChat(): void {
	ai.messages = [];
}
