<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	const config = $derived(data.config);
	const ropa = $derived(data.ropa);
	const configured = $derived(data.configured);

	const rights = [
		{ name: 'Access', article: 'Art. 15', desc: 'Get a copy of the data we hold about you.' },
		{ name: 'Rectification', article: 'Art. 16', desc: 'Correct data that is wrong or incomplete.' },
		{ name: 'Erasure', article: 'Art. 17', desc: 'Have your data deleted ("right to be forgotten").' },
		{ name: 'Restriction', article: 'Art. 18', desc: 'Limit how we process your data.' },
		{ name: 'Portability', article: 'Art. 20', desc: 'Receive your data in a machine-readable format.' },
		{ name: 'Objection', article: 'Art. 21', desc: 'Object to certain processing.' },
		{ name: 'Withdraw consent', article: 'Art. 7(3)', desc: 'Withdraw any consent at any time.' }
	];
</script>

<svelte:head>
	<title>Privacy Policy — basedstack</title>
</svelte:head>

<article class="mx-auto w-full max-w-3xl px-6 py-16">
	<header class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight" style="font-family: var(--font-display);">
			Privacy Policy
		</h1>
		<p class="text-muted-foreground mt-2 text-sm">
			Version {config.policyVersion} · Last updated {config.policyLastUpdated}
		</p>
		{#if !configured}
			<p class="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-md border px-3 py-2 text-xs">
				⚠️ This policy still contains placeholders. Run the <code>/gdpr init</code> skill or edit
				<code>src/lib/gdpr/config.ts</code> to fill in your details.
			</p>
		{/if}
	</header>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Who is responsible</h2>
		<p class="text-muted-foreground text-sm leading-relaxed">
			The controller responsible for your personal data is:
		</p>
		<address class="text-sm not-italic leading-relaxed">
			<strong>{config.legalEntity}</strong><br />
			{#each config.address.split('\n') as line (line)}
				{line}<br />
			{/each}
			<a href="mailto:{config.email}" class="text-amber hover:underline">{config.email}</a>
			{#if config.phone}<br />{config.phone}{/if}
		</address>
		{#if config.dpo?.email}
			<p class="text-muted-foreground text-sm">
				Data Protection Officer: {config.dpo.name ?? ''}
				(<a href="mailto:{config.dpo.email}" class="text-amber hover:underline">{config.dpo.email}</a>)
			</p>
		{/if}
	</section>

	<section class="mt-10 space-y-3">
		<h2 class="text-xl font-semibold">What we process & why</h2>
		<p class="text-muted-foreground text-sm leading-relaxed">
			We process the following categories of personal data. Your data is stored in
			<strong>{config.dataLocation}</strong>.
		</p>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="text-muted-foreground border-b border-white/10 text-xs uppercase">
					<tr>
						<th class="py-2 pr-4">Data</th>
						<th class="py-2 pr-4">Purpose</th>
						<th class="py-2 pr-4">Legal basis</th>
						<th class="py-2">Kept</th>
					</tr>
				</thead>
				<tbody>
					{#each ropa.activities as a (a.name)}
						<tr class="border-b border-white/5 align-top">
							<td class="py-2 pr-4 font-medium capitalize">{a.name}</td>
							<td class="text-muted-foreground py-2 pr-4">{a.purpose}</td>
							<td class="text-muted-foreground py-2 pr-4">{a.lawfulBasis}</td>
							<td class="text-muted-foreground py-2">{a.retention}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="mt-10 space-y-3">
		<h2 class="text-xl font-semibold">Who we share it with</h2>
		{#if ropa.recipients.length === 0}
			<p class="text-muted-foreground text-sm leading-relaxed">
				We do not share your personal data with any external processors. The application is
				self-hosted and your data stays with us.
			</p>
		{:else}
			<p class="text-muted-foreground text-sm leading-relaxed">
				We rely on the following processors, each bound by a data-processing agreement:
			</p>
			<ul class="space-y-2 text-sm">
				{#each ropa.recipients as r (r.name)}
					<li class="flex flex-wrap items-center gap-2">
						<strong>{r.name}</strong>
						<span class="text-muted-foreground">— {r.purpose}</span>
						<Badge variant="outline" class="text-[11px]">{r.location}</Badge>
						{#if r.safeguard}<Badge variant="outline" class="text-[11px]">{r.safeguard}</Badge>{/if}
					</li>
				{/each}
			</ul>
			{#if ropa.internationalTransfers.length > 0}
				<p class="text-muted-foreground mt-2 text-xs leading-relaxed">
					Some processors are outside the EU/EEA; transfers are safeguarded as noted above.
				</p>
			{/if}
		{/if}
	</section>

	<section class="mt-10 space-y-3">
		<h2 class="text-xl font-semibold">Your rights</h2>
		<p class="text-muted-foreground text-sm leading-relaxed">
			Under the GDPR you have the following rights. You can exercise access, portability and
			erasure yourself from your
			<a href="/account/privacy" class="text-amber hover:underline">privacy dashboard</a>; for
			anything else, contact us.
		</p>
		<ul class="space-y-2">
			{#each rights as r (r.name)}
				<li class="text-sm">
					<span class="font-medium">{r.name}</span>
					<span class="text-muted-foreground/60 text-xs"> ({r.article})</span>
					<span class="text-muted-foreground"> — {r.desc}</span>
				</li>
			{/each}
		</ul>
		<p class="text-muted-foreground text-sm leading-relaxed">
			You also have the right to lodge a complaint with a supervisory authority
			{#if config.supervisoryAuthority}({config.supervisoryAuthority}){/if} (Art. 77).
		</p>
	</section>

	<footer class="text-muted-foreground/50 mt-12 border-t border-white/10 pt-6 text-xs">
		See also our <a href="/legal/imprint" class="hover:underline">imprint</a>.
	</footer>
</article>
