<script lang="ts">
	import Chat from '$lib/ai/Chat.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Cpu from '@lucide/svelte/icons/cpu';
	import Sparkles from '@lucide/svelte/icons/sparkles';
</script>

<svelte:head>
	<title>Local AI — basedstack</title>
	<meta name="description" content="Chat with an LLM running entirely in your browser." />
</svelte:head>

<div class="grain min-h-screen">
	<div class="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
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

		<Chat fill />
	</div>
</div>
