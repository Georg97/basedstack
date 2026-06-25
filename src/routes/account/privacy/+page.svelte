<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import Input from '$lib/components/ui/input/input.svelte';
	import Shield from '@lucide/svelte/icons/shield';
	import Download from '@lucide/svelte/icons/download';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import History from '@lucide/svelte/icons/history';
	import Loader from '@lucide/svelte/icons/loader';
	import type { PageServerData, ActionData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let confirmText = $state('');
	let deleting = $state(false);

	const fmt = (d: string | Date) => new Date(d).toLocaleString();

	const titles: Record<string, string> = {
		profile: 'Profile',
		sessions: 'Sign-in sessions',
		linkedAccounts: 'Linked login methods',
		consents: 'Consent choices',
		dataRequests: 'Privacy requests'
	};
</script>

<svelte:head>
	<title>Privacy & your data — basedstack</title>
</svelte:head>

<div class="mx-auto w-full max-w-2xl px-6 py-12">
	<header class="mb-10">
		<div class="mb-3 flex items-center gap-2.5">
			<div class="from-amber to-terracotta flex size-9 items-center justify-center rounded-xl bg-gradient-to-br">
				<Shield class="size-4.5 text-white" />
			</div>
			<h1 class="text-2xl font-bold tracking-tight" style="font-family: var(--font-display);">
				Privacy & your data
			</h1>
		</div>
		<p class="text-muted-foreground text-sm leading-relaxed">
			Under the GDPR you can see, download, and delete the personal data we hold about you. Do
			any of that from here.
		</p>
	</header>

	<!-- What we hold -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Data we hold about you</Card.Title>
			<Card.Description>Generated from our data registry — this is the full list.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each data.holdings as h (h.key)}
				<div>
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm font-medium">{titles[h.key] ?? h.key}</span>
						{#if h.retention}
							<Badge variant="outline" class="text-muted-foreground text-[11px]">{h.retention}</Badge>
						{/if}
					</div>
					{#if h.purpose}
						<p class="text-muted-foreground mt-0.5 text-xs">
							{h.purpose}{#if h.lawfulBasis} · {h.lawfulBasis}{/if}
						</p>
					{/if}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Export -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Download your data</Card.Title>
			<Card.Description>
				A machine-readable JSON copy of everything above (Art. 15 & 20).
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Button href="/account/privacy/export" download class="gap-2">
				<Download class="size-4" />
				Download my data (JSON)
			</Button>
		</Card.Content>
	</Card.Root>

	<!-- Request history -->
	{#if data.requests.length > 0}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<History class="size-4" /> Request history
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#each data.requests as r (r.id)}
					<div class="flex items-center justify-between gap-3 text-sm">
						<span class="capitalize">{r.type}</span>
						<span class="text-muted-foreground flex items-center gap-2 text-xs">
							{fmt(r.requestedAt)}
							<Badge variant="outline" class="text-[10px] capitalize">{r.status}</Badge>
						</span>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}

	<Separator class="my-8" />

	<!-- Danger zone: erasure -->
	<Card.Root class="border-destructive/30">
		<Card.Header>
			<Card.Title class="text-destructive flex items-center gap-2">
				<Trash2 class="size-4" /> Delete my account
			</Card.Title>
			<Card.Description>
				Permanently deletes your account and all personal data. This cannot be undone. We keep an
				anonymised record that the deletion happened, as the law requires.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/erase"
				use:enhance={() => {
					deleting = true;
					return async ({ update }) => {
						await update();
						deleting = false;
					};
				}}
				class="space-y-3"
			>
				<label class="text-muted-foreground text-xs" for="confirm">
					Type <span class="text-destructive font-mono font-semibold">DELETE</span> to confirm.
				</label>
				<Input
					id="confirm"
					name="confirm"
					bind:value={confirmText}
					placeholder="DELETE"
					autocomplete="off"
				/>
				{#if form?.error}
					<p class="text-destructive text-xs">{form.error}</p>
				{/if}
				<Button
					type="submit"
					variant="destructive"
					disabled={confirmText !== 'DELETE' || deleting}
					class="gap-2"
				>
					{#if deleting}
						<Loader class="size-4 animate-spin" />
					{/if}
					Delete everything
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
