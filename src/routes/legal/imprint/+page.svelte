<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	const config = $derived(data.config);
	const configured = $derived(data.configured);
</script>

<svelte:head>
	<title>Imprint — basedstack</title>
</svelte:head>

<article class="mx-auto w-full max-w-3xl px-6 py-16">
	<header class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight" style="font-family: var(--font-display);">
			Imprint
		</h1>
		<p class="text-muted-foreground mt-2 text-sm">
			Information required under applicable disclosure law (e.g. § 5 DDG in Germany).
		</p>
		{#if !configured}
			<p class="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-md border px-3 py-2 text-xs">
				⚠️ This imprint still contains placeholders. Run the <code>/gdpr init</code> skill or edit
				<code>src/lib/gdpr/config.ts</code>.
			</p>
		{/if}
	</header>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Responsible for this site</h2>
		<address class="text-sm not-italic leading-relaxed">
			<strong>{config.legalEntity}</strong><br />
			{config.contactName}<br />
			{#each config.address.split('\n') as line (line)}
				{line}<br />
			{/each}
		</address>
	</section>

	<section class="mt-8 space-y-3">
		<h2 class="text-xl font-semibold">Contact</h2>
		<p class="text-sm leading-relaxed">
			Email:
			<a href="mailto:{config.email}" class="text-amber hover:underline">{config.email}</a>
			{#if config.phone}<br />Phone: {config.phone}{/if}
		</p>
	</section>

	{#if config.supervisoryAuthority}
		<section class="mt-8 space-y-3">
			<h2 class="text-xl font-semibold">Supervisory authority</h2>
			<p class="text-muted-foreground text-sm leading-relaxed">{config.supervisoryAuthority}</p>
		</section>
	{/if}

	<footer class="text-muted-foreground/50 mt-12 border-t border-white/10 pt-6 text-xs">
		See also our <a href="/legal/privacy" class="hover:underline">privacy policy</a>.
	</footer>
</article>
