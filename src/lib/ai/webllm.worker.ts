/// <reference lib="webworker" />
import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm';

/**
 * Dedicated Web Worker that hosts the WebLLM engine. Running inference off the main
 * thread keeps the UI responsive while the model downloads and generates. It is
 * instantiated lazily from engine.svelte.ts via `new Worker(new URL(...))`, so the
 * heavy WebLLM/WASM bundle is code-split and never touches the server build.
 */
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => {
	handler.onmessage(msg);
};
