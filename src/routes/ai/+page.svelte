<script lang="ts">
	import { onMount } from 'svelte';
	import { ai, init, load, send, clearChat } from '$lib/ai/engine.svelte';
	import { formatSize } from '$lib/ai/models';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Cpu from '@lucide/svelte/icons/cpu';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Download from '@lucide/svelte/icons/download';
	import Loader from '@lucide/svelte/icons/loader';
	import Send from '@lucide/svelte/icons/send';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Eraser from '@lucide/svelte/icons/eraser';

	let draft = $state('');
	let scroller = $state<HTMLDivElement>();

	onMount(() => {
		init();
	});

	const progressPct = $derived(Math.round(ai.progress * 100));
	const busy = $derived(ai.phase === 'loading' || ai.phase === 'generating');

	function onSend(e: Event) {
		e.preventDefault();
		const text = draft.trim();
		if (!text || ai.phase !== 'ready') return;
		draft = '';
		send(text);
	}

	// Keep the latest message in view while it streams.
	$effect(() => {
		ai.messages.length;
		ai.messages.at(-1)?.content;
		scroller?.scrollTo({ top: scroller.scrollHeight });
	});
</script>

<svelte:head>
	<title>Local AI — basedstack</title>
	<meta name="description" content="Chat with an LLM running entirely in your browser." />
</svelte:head>

<div class="grain min-h-screen">
	<div class="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
		<!-- header -->
		<header class="mb-6 flex items-center justify-between">
			<a href="/" class="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors">
				<ArrowLeft class="size-4" />
				Home
			</a>
			<div class="flex items-center gap-2">
				<div class="from-amber to-terracotta flex size-7 items-center justify-center rounded-lg bg-gradient-to-br">
					<Cpu class="text-primary-foreground size-4" />
				</div>
				<span class="font-semibold tracking-tight" style="font-family: var(--font-display);">Local AI</span>
				<Badge class="border-amber/20 bg-amber/10 text-amber">
					<Sparkles class="mr-1 size-3" />
					on-device
				</Badge>
			</div>
		</header>

		{#if ai.phase === 'unknown'}
			<Card.Card class="bg-card/50 border-white/[0.06]">
				<Card.CardContent class="text-muted-foreground flex items-center gap-3 p-6 text-sm">
					<Loader class="size-4 animate-spin" />
					Checking your device…
				</Card.CardContent>
			</Card.Card>
		{:else if ai.phase === 'unsupported'}
			<Card.Card class="bg-card/50 border-white/[0.06]">
				<Card.CardHeader>
					<Card.CardTitle class="flex items-center gap-2 text-base" style="font-family: var(--font-display);">
						<TriangleAlert class="text-amber size-5" />
						WebGPU not available
					</Card.CardTitle>
					<Card.CardDescription class="leading-relaxed">
						On-device inference needs WebGPU. Try a recent desktop Chrome or Edge, or a browser with
						WebGPU enabled. {ai.error}
					</Card.CardDescription>
				</Card.CardHeader>
			</Card.Card>
		{:else}
			<!-- model bar -->
			<Card.Card class="bg-card/50 mb-4 border-white/[0.06]">
				<Card.CardContent class="p-4">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-end">
						<div class="flex-1">
							<label for="model" class="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
								Model
							</label>
							<select
								id="model"
								bind:value={ai.selectedModel}
								disabled={busy}
								class="bg-secondary/40 focus:border-amber/30 focus:ring-amber/20 w-full rounded-lg border border-white/[0.08] px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50"
							>
								{#each ai.models as m (m.id)}
									<option value={m.id}>
										{m.label} · {formatSize(m.vramMB)}{m.fits ? '' : ' — may not fit'}
									</option>
								{/each}
							</select>
						</div>
						<Button
							onclick={() => load(ai.selectedModel)}
							disabled={busy}
							class="from-amber to-copper text-primary-foreground border-0 bg-gradient-to-r hover:opacity-90"
						>
							{#if ai.phase === 'loading'}
								<Loader class="mr-1.5 size-4 animate-spin" />
								Loading…
							{:else}
								<Download class="mr-1.5 size-4" />
								{ai.activeModel === ai.selectedModel ? 'Reload' : ai.activeModel ? 'Switch' : 'Load'}
							{/if}
						</Button>
					</div>

					{#if ai.phase === 'loading'}
						<div class="mt-3">
							<div class="bg-secondary/80 h-1.5 overflow-hidden rounded-full">
								<div class="from-amber to-copper h-full rounded-full bg-gradient-to-r transition-all duration-300" style="width: {progressPct}%;"></div>
							</div>
							<p class="text-muted-foreground mt-1.5 truncate text-xs">{ai.progressText || 'Preparing…'}</p>
						</div>
					{/if}

					{#if ai.error && ai.phase === 'error'}
						<p class="text-destructive mt-3 flex items-center gap-1.5 text-sm">
							<TriangleAlert class="size-4 shrink-0" />
							{ai.error}
						</p>
					{/if}

					{#if ai.activeModel && ai.phase !== 'loading'}
						<p class="text-muted-foreground/70 mt-2 text-xs">
							Active: <span class="text-foreground font-mono">{ai.activeModel}</span> · the first load
							downloads the weights, then they're cached in your browser.
						</p>
					{/if}
				</Card.CardContent>
			</Card.Card>

			<!-- chat -->
			{#if ai.activeModel && (ai.phase === 'ready' || ai.phase === 'generating')}
				<Card.Card class="bg-card/50 flex min-h-0 flex-1 flex-col overflow-hidden border-white/[0.06]">
					<div bind:this={scroller} class="flex-1 space-y-3 overflow-y-auto p-4">
						{#if ai.messages.length === 0}
							<p class="text-muted-foreground/50 py-8 text-center text-sm">
								Ask anything — it runs entirely in your browser.
							</p>
						{/if}
						{#each ai.messages as m, i (i)}
							<div class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}">
								<div
									class="max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap {m.role ===
									'user'
										? 'bg-amber/15 text-foreground'
										: 'bg-secondary/50 text-foreground'}"
								>
									{#if m.content}
										{m.content}
									{:else}
										<Loader class="size-4 animate-spin" />
									{/if}
								</div>
							</div>
						{/each}
					</div>

					<div class="border-t border-white/[0.06] p-3">
						<form class="flex gap-2" onsubmit={onSend}>
							<Input
								bind:value={draft}
								placeholder="Message…"
								disabled={ai.phase === 'generating'}
								class="bg-secondary/30 placeholder:text-muted-foreground/40 focus:border-amber/30 focus:ring-amber/20 border-white/[0.06]"
							/>
							<Button
								type="submit"
								disabled={ai.phase === 'generating' || !draft.trim()}
								class="from-amber to-copper text-primary-foreground border-0 bg-gradient-to-r hover:opacity-90"
							>
								{#if ai.phase === 'generating'}
									<Loader class="size-4 animate-spin" />
								{:else}
									<Send class="size-4" />
								{/if}
							</Button>
						</form>
						{#if ai.messages.length > 0}
							<div class="mt-2 flex justify-end">
								<button
									onclick={clearChat}
									class="text-muted-foreground/60 hover:text-foreground flex items-center gap-1 text-xs transition-colors"
								>
									<Eraser class="size-3" />
									New chat
								</button>
							</div>
						{/if}
					</div>
				</Card.Card>
			{/if}
		{/if}
	</div>
</div>
