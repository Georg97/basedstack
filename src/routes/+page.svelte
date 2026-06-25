<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Box from '@lucide/svelte/icons/box';
	import Check from '@lucide/svelte/icons/check';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Code from '@lucide/svelte/icons/code';
	import Copy from '@lucide/svelte/icons/copy';
	import Cpu from '@lucide/svelte/icons/cpu';
	import Eye from '@lucide/svelte/icons/eye';
	import Github from '@lucide/svelte/icons/github';
	import Layers from '@lucide/svelte/icons/layers';
	import Loader from '@lucide/svelte/icons/loader';
	import Mail from '@lucide/svelte/icons/mail';
	import Palette from '@lucide/svelte/icons/palette';
	import Radio from '@lucide/svelte/icons/radio';
	import Send from '@lucide/svelte/icons/send';
	import Server from '@lucide/svelte/icons/server';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Terminal from '@lucide/svelte/icons/terminal';
	import Zap from '@lucide/svelte/icons/zap';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { authClient } from '$lib/auth-client';
	import { getTags, liveMessages, sendMessage } from './data.remote';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Chat from '$lib/ai/Chat.svelte';

	let copied = $state(false);
	let showEffects = $state(true);
	let activeSection = $state('hero');

	const sections = [
		{ id: 'hero', label: 'Home' },
		{ id: 'stack', label: 'Stack' },
		{ id: 'features', label: 'Features' },
		{ id: 'queries', label: 'Queries' },
		{ id: 'ai', label: 'Local AI' },
		{ id: 'forms', label: 'Forms' },
		{ id: 'cta', label: 'Get Started' }
	];

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeSection = entry.target.id;
					}
				}
			},
			{ rootMargin: '-40% 0px -55% 0px' }
		);

		for (const section of sections) {
			const el = document.getElementById(section.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	});

	let { data } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Message sent!', {
					description: 'Thanks for reaching out. We\'ll get back to you soon.'
				});
			} else {
				toast.error('Submission failed', {
					description: 'Please fix the errors and try again.'
				});
			}
		}
	});

	const chat = liveMessages();
	let draft = $state('');

	async function send() {
		const text = draft.trim();
		if (!text) return;
		draft = '';
		await sendMessage(text);
	}

	function copyCommand() {
		navigator.clipboard.writeText('bunx sv create --template minimal .');
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	const stackItems = [
		{
			name: 'SvelteKit',
			version: '2.x',
			description: 'Cybernetically enhanced web apps. File-based routing, SSR, and a compiler that turns your components into surgical DOM updates.',
			icon: Zap,
			color: 'text-amber'
		},
		{
			name: 'Tailwind CSS',
			version: '4.0',
			description: 'A new engine rewritten from scratch. Zero-config, lightning fast, CSS-native. The utility framework that won.',
			icon: Palette,
			color: 'text-copper'
		},
		{
			name: 'shadcn-svelte',
			version: 'latest',
			description: 'Beautifully designed components you copy into your project. Accessible, customizable, and yours to own forever.',
			icon: Box,
			color: 'text-terracotta'
		},
		{
			name: 'TypeScript',
			version: '5.x',
			description: 'Type safety without the ceremony. Catch errors before they happen, get autocomplete everywhere.',
			icon: Code,
			color: 'text-amber'
		}
	];
</script>

<svelte:head>
	<title>basedstack — Build your stack, your way</title>
	<meta name="description" content="A modern web development stack built with SvelteKit, Tailwind CSS v4, and shadcn-svelte." />
</svelte:head>

<div class="grain min-h-screen overflow-hidden">
	<!-- ========== NAV ========== -->
	<header class="bg-background/60 fixed top-0 z-50 w-full border-b border-white/[0.06] backdrop-blur-2xl">
		<nav class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
			<a href="/" class="group font-display flex items-center gap-2 text-base font-semibold tracking-tight sm:gap-2.5 sm:text-lg" style="font-family: var(--font-display);">
				<div class="from-amber to-terracotta flex size-7 items-center justify-center rounded-lg bg-gradient-to-br sm:size-8">
					<Layers class="text-primary-foreground size-3.5 sm:size-4" />
				</div>
				<span class="group-hover:text-amber transition-colors">based</span><span class="text-muted-foreground">stack</span>
			</a>

			<div class="flex items-center gap-1.5 sm:gap-2">
				<Tooltip.Root>
					<Tooltip.Trigger>
						<div class="bg-secondary/50 hidden items-center gap-2 rounded-full border border-white/[0.06] px-3 py-1.5 sm:flex">
							<span class="text-muted-foreground text-xs">Effects</span>
							<Switch bind:checked={showEffects} />
						</div>
					</Tooltip.Trigger>
					<Tooltip.Content>Toggle visual effects</Tooltip.Content>
				</Tooltip.Root>
				<Button variant="ghost" size="sm" href="https://github.com/Georg97/basedstack" target="_blank" class="text-muted-foreground hover:text-foreground size-8 p-0 sm:size-auto sm:p-2">
					<Github class="size-4" />
				</Button>
				{#if data.user}
					<span class="text-muted-foreground hidden text-sm sm:block">{data.user.name}</span>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Button
								variant="ghost"
								size="sm"
								class="text-muted-foreground hover:text-destructive size-8 p-0 sm:size-auto sm:p-2"
								onclick={async () => {
									await authClient.signOut();
									goto('/login');
								}}
							>
								<LogOut class="size-4" />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>Sign out</Tooltip.Content>
					</Tooltip.Root>
				{:else}
					<Button size="sm" href="/login" class="from-amber to-copper text-primary-foreground border-0 bg-gradient-to-r text-xs hover:opacity-90 sm:text-sm">
						Sign In
						<ArrowRight class="ml-1 size-3.5" />
					</Button>
				{/if}
			</div>
		</nav>
	</header>

	<!-- ========== SECTION NAV ========== -->
	<nav class="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
		<div class="flex flex-col items-start gap-1">
			{#each sections as section}
				<a
					href="#{section.id}"
					class="group flex items-center gap-3 rounded-full py-1.5 pr-3 pl-2 text-xs transition-all duration-300 {activeSection === section.id ? 'text-amber bg-amber/10' : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/[0.03]'}"
				>
					<span
						class="block size-1.5 rounded-full transition-all duration-300 {activeSection === section.id ? 'bg-amber scale-125' : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'}"
					></span>
					{section.label}
				</a>
			{/each}
		</div>
	</nav>

	<!-- ========== HERO ========== -->
	<section id="hero" class="relative flex min-h-[92vh] items-center justify-center pt-16">
		<!-- Gradient orbs -->
		{#if showEffects}
			<div
				class="animate-float-slower pointer-events-none absolute top-20 -left-32 size-[500px] rounded-full opacity-20 blur-[120px]"
				style="background: radial-gradient(circle, var(--amber), transparent 70%);"
			></div>
			<div
				class="animate-float-slow pointer-events-none absolute -right-20 bottom-40 size-[400px] rounded-full opacity-15 blur-[100px]"
				style="background: radial-gradient(circle, var(--terracotta), transparent 70%);"
			></div>
			<div
				class="pointer-events-none absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-[80px]"
				style="background: radial-gradient(circle, var(--copper), transparent 60%);"
			></div>
		{/if}

		<!-- Grid pattern -->
		{#if showEffects}
			<div
				class="pointer-events-none absolute inset-0 opacity-[0.03]"
				style="background-image: linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px); background-size: 60px 60px;"
			></div>
		{/if}

		<div class="relative mx-auto max-w-6xl px-6 lg:px-8">
			<div class="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
				<!-- Left: Text -->
				<div>
					<div class="animate-fade-up">
						<Badge class="border-amber/20 bg-amber/10 text-amber hover:bg-amber/15 mb-6">
							<Sparkles class="mr-1 size-3" />
							Open Source Stack
						</Badge>
					</div>

					<h1 class="animate-fade-up text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl" style="font-family: var(--font-display); animation-delay: 0.1s;">
						Build your
						<br />
						<span class="from-amber via-copper to-terracotta bg-gradient-to-r bg-clip-text text-transparent">stack</span>,<br />
						your
						<span class="text-muted-foreground italic">way</span>.
					</h1>

					<p class="animate-fade-up text-muted-foreground mt-7 max-w-lg text-lg leading-relaxed" style="animation-delay: 0.2s;">
						A minimal, opinionated starting point for developers who want control.
						<span class="text-foreground">SvelteKit</span> for the framework.
						<span class="text-foreground">Tailwind</span> for styling.
						<span class="text-foreground">shadcn</span> for components. Nothing more.
					</p>

					<!-- CTA row -->
					<div class="animate-fade-up mt-9 flex flex-wrap items-center gap-3" style="animation-delay: 0.3s;">
						<Button size="lg" class="from-amber via-copper to-terracotta text-primary-foreground border-0 bg-gradient-to-r px-7 text-base hover:opacity-90">
							Get Started
							<ArrowRight class="ml-1.5 size-4" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							href="https://github.com/Georg97/basedstack"
							target="_blank"
							class="border-white/10 text-base hover:border-white/20 hover:bg-white/[0.04]"
						>
							<Github class="mr-1.5 size-4" />
							Source Code
						</Button>
					</div>

					<!-- Install command -->
					<div class="animate-fade-up mt-8" style="animation-delay: 0.4s;">
						<button
							onclick={copyCommand}
							class="group bg-secondary/40 hover:border-amber/20 hover:bg-secondary/60 flex w-full max-w-md cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] px-5 py-3.5 font-mono text-sm transition-all"
						>
							<Terminal class="text-amber size-4 shrink-0" />
							<code class="text-muted-foreground flex-1 text-left">
								<span class="text-amber/70">$</span> bunx sv create --template minimal .
							</code>
							{#if copied}
								<Check class="size-4 text-green-400 transition-all" />
							{:else}
								<Copy class="text-muted-foreground size-4 opacity-0 transition-all group-hover:opacity-100" />
							{/if}
						</button>
					</div>
				</div>

				<!-- Right: Visual element — Bento preview -->
				<div class="animate-fade-up relative hidden lg:block" style="animation-delay: 0.3s;">
					<div class="grid grid-cols-2 gap-3">
						<!-- Card 1: Component preview -->
						<Card.Card class="bg-card/60 col-span-2 overflow-hidden border-white/[0.06] backdrop-blur-sm">
							<Card.CardHeader class="pb-3">
								<div class="flex items-center gap-2">
									<div class="bg-terracotta size-2.5 rounded-full"></div>
									<div class="bg-amber size-2.5 rounded-full"></div>
									<div class="size-2.5 rounded-full bg-green-500/60"></div>
									<span class="text-muted-foreground ml-2 font-mono text-xs">+page.svelte</span>
								</div>
							</Card.CardHeader>
							<Card.CardContent class="pb-4">
								<pre class="text-muted-foreground text-xs leading-relaxed"><code
										><span class="text-amber/80">&lt;script&gt;</span>
  <span class="text-copper">import</span> {'{'} Button {'}'} <span class="text-copper">from</span> <span class="text-green-400/70">'$lib/ui/button'</span>;
  <span class="text-copper">import</span> {'{'} Card {'}'} <span class="text-copper">from</span> <span class="text-green-400/70">'$lib/ui/card'</span>;
<span class="text-amber/80">&lt;/script&gt;</span>

<span class="text-amber/80">&lt;Card&gt;</span>
  <span class="text-amber/80">&lt;Button</span> <span class="text-copper">variant=</span><span class="text-green-400/70">"default"</span><span class="text-amber/80">&gt;</span>
    Ship it <span class="text-terracotta">&#x1f680;</span>
  <span class="text-amber/80">&lt;/Button&gt;</span>
<span class="text-amber/80">&lt;/Card&gt;</span></code
									></pre>
							</Card.CardContent>
						</Card.Card>

						<!-- Card 2: Buttons showcase -->
						<Card.Card class="bg-card/60 border-white/[0.06] backdrop-blur-sm">
							<Card.CardHeader class="pb-2">
								<Card.CardTitle class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Buttons</Card.CardTitle>
							</Card.CardHeader>
							<Card.CardContent class="space-y-2 pb-4">
								<Button size="sm" class="from-amber to-copper text-primary-foreground w-full border-0 bg-gradient-to-r">Primary</Button>
								<Button size="sm" variant="outline" class="w-full border-white/10">Outline</Button>
								<Button size="sm" variant="secondary" class="w-full">Secondary</Button>
							</Card.CardContent>
						</Card.Card>

						<!-- Card 3: Badges & Avatars -->
						<Card.Card class="bg-card/60 border-white/[0.06] backdrop-blur-sm">
							<Card.CardHeader class="pb-2">
								<Card.CardTitle class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Badges</Card.CardTitle>
							</Card.CardHeader>
							<Card.CardContent class="flex flex-wrap gap-1.5 pb-4">
								<Badge class="border-amber/20 bg-amber/10 text-amber">svelte</Badge>
								<Badge class="border-copper/20 bg-copper/10 text-copper">tailwind</Badge>
								<Badge class="border-terracotta/20 bg-terracotta/10 text-terracotta">shadcn</Badge>
								<Badge variant="outline" class="border-white/10">typescript</Badge>
								<Badge class="border-green-400/20 bg-green-400/10 text-green-400/80">bun</Badge>
							</Card.CardContent>
						</Card.Card>

						<!-- Card 4: Wide card with avatars -->
						<Card.Card class="bg-card/60 col-span-2 border-white/[0.06] backdrop-blur-sm">
							<Card.CardContent class="flex items-center justify-between py-4">
								<div class="flex items-center gap-3">
									<div class="flex -space-x-2">
										<Avatar.Root class="border-card size-7 border-2">
											<Avatar.Fallback class="bg-amber/20 text-amber text-xs">GH</Avatar.Fallback>
										</Avatar.Root>
										<Avatar.Root class="border-card size-7 border-2">
											<Avatar.Fallback class="bg-copper/20 text-copper text-xs">SK</Avatar.Fallback>
										</Avatar.Root>
										<Avatar.Root class="border-card size-7 border-2">
											<Avatar.Fallback class="bg-terracotta/20 text-terracotta text-xs">TW</Avatar.Fallback>
										</Avatar.Root>
									</div>
									<span class="text-muted-foreground text-sm">Built by the community</span>
								</div>
								<Badge variant="outline" class="border-amber/20 text-amber text-xs">
									<Sparkles class="mr-1 size-3" />
									v0.1
								</Badge>
							</Card.CardContent>
						</Card.Card>
					</div>

					<!-- Decorative diagonal line -->
					{#if showEffects}
						<div class="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full opacity-20 blur-[60px]" style="background: var(--amber);"></div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- ========== SEPARATOR WITH LABEL ========== -->
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="relative flex items-center py-4">
			<Separator class="flex-1 bg-white/[0.06]" />
			<span class="text-muted-foreground/50 mx-4 shrink-0 text-[10px] font-medium tracking-[0.2em] uppercase">The Stack</span>
			<Separator class="flex-1 bg-white/[0.06]" />
		</div>
	</div>

	<!-- ========== STACK TABS ========== -->
	<section id="stack" class="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
		{#if showEffects}
			<div class="pointer-events-none absolute top-0 left-1/2 size-[500px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[100px]" style="background: var(--copper);"></div>
		{/if}

		<div class="relative">
			<div class="mb-14 max-w-xl">
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl" style="font-family: var(--font-display);">
					Everything <span class="text-muted-foreground italic">carefully</span> chosen
				</h2>
				<p class="text-muted-foreground mt-4 text-lg leading-relaxed">
					Each piece of the stack earns its place. No bloat, no compromise — just tools that work brilliantly together.
				</p>
			</div>

			<Tabs.Root value="SvelteKit" class="relative">
				<Tabs.List class="bg-secondary/30 mb-8 flex w-full justify-start gap-1 rounded-xl border border-white/[0.06] p-1.5 backdrop-blur-sm sm:w-fit">
					{#each stackItems as item}
						<Tabs.Trigger
							value={item.name}
							class="text-muted-foreground data-[state=active]:from-amber/20 data-[state=active]:to-copper/10 data-[state=active]:text-amber rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:shadow-sm"
						>
							{item.name}
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				{#each stackItems as item}
					<Tabs.Content value={item.name}>
						<Card.Card class="bg-card/40 overflow-hidden border-white/[0.06] backdrop-blur-sm">
							<div class="grid divide-x divide-white/[0.06] md:grid-cols-[1fr_1.5fr]">
								<Card.CardHeader class="flex flex-col justify-center p-8">
									<div class="bg-secondary/50 mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/[0.06]">
										<item.icon class="size-7 {item.color}" />
									</div>
									<Card.CardTitle class="text-2xl" style="font-family: var(--font-display);">{item.name}</Card.CardTitle>
									<Badge variant="outline" class="text-muted-foreground mt-2 w-fit border-white/10 text-xs">v{item.version}</Badge>
								</Card.CardHeader>
								<Card.CardContent class="flex items-center p-8">
									<p class="text-muted-foreground text-lg leading-relaxed">
										{item.description}
									</p>
								</Card.CardContent>
							</div>
						</Card.Card>
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		</div>
	</section>

	<!-- ========== FEATURES BENTO GRID ========== -->
	<section id="features" class="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
		<div class="mb-14 text-center">
			<Badge class="border-copper/20 bg-copper/10 text-copper mb-4">
				<Eye class="mr-1 size-3" />
				Showcase
			</Badge>
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl" style="font-family: var(--font-display);">
				What's <span class="from-amber to-terracotta bg-gradient-to-r bg-clip-text text-transparent">possible</span>
			</h2>
			<p class="text-muted-foreground mx-auto mt-4 max-w-lg leading-relaxed">shadcn-svelte gives you production-grade components out of the box. Here's a taste.</p>
		</div>

		<div class="grid gap-4 md:grid-cols-3 md:grid-rows-2">
			<!-- Large card: Performance -->
			<Card.Card class="group bg-card/50 hover:border-amber/20 hover:bg-card/70 overflow-hidden border-white/[0.06] backdrop-blur-sm transition-all duration-500 md:row-span-2">
				<Card.CardHeader class="relative p-8 pb-4">
					{#if showEffects}
						<div
							class="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-30"
							style="background: var(--amber);"
						></div>
					{/if}
					<div class="relative">
						<div class="border-amber/20 bg-amber/10 mb-5 flex size-12 items-center justify-center rounded-2xl border">
							<Zap class="text-amber size-6" />
						</div>
						<Card.CardTitle class="text-xl" style="font-family: var(--font-display);">Blazing Fast</Card.CardTitle>
						<Card.CardDescription class="mt-2 text-base leading-relaxed">
							Svelte compiles away the framework. No virtual DOM, no runtime overhead. Your app ships lean.
						</Card.CardDescription>
					</div>
				</Card.CardHeader>
				<Card.CardContent class="p-8 pt-4">
					<div class="space-y-4">
						{#each [{ label: 'First Paint', value: '0.8s', pct: 90 }, { label: 'Bundle Size', value: '12kb', pct: 95 }, { label: 'Lighthouse', value: '99', pct: 99 }] as metric}
							<div>
								<div class="mb-1.5 flex items-center justify-between text-sm">
									<span class="text-muted-foreground">{metric.label}</span>
									<span class="text-amber font-mono">{metric.value}</span>
								</div>
								<div class="bg-secondary/80 h-1.5 overflow-hidden rounded-full">
									<div class="from-amber to-copper h-full rounded-full bg-gradient-to-r transition-all duration-1000" style="width: {metric.pct}%;"></div>
								</div>
							</div>
						{/each}
					</div>
				</Card.CardContent>
			</Card.Card>

			<!-- Top right: Type Safety -->
			<Card.Card class="group bg-card/50 hover:border-copper/20 hover:bg-card/70 border-white/[0.06] backdrop-blur-sm transition-all duration-500">
				<Card.CardHeader class="p-6">
					<div class="border-copper/20 bg-copper/10 mb-3 flex size-10 items-center justify-center rounded-xl border">
						<Code class="text-copper size-5" />
					</div>
					<Card.CardTitle class="text-lg" style="font-family: var(--font-display);">Type Safe</Card.CardTitle>
					<Card.CardDescription class="mt-1 leading-relaxed">Full TypeScript support from routes to components. Catch bugs at build time, not in production.</Card.CardDescription>
				</Card.CardHeader>
			</Card.Card>

			<!-- Top far right: DX -->
			<Card.Card class="group bg-card/50 hover:border-terracotta/20 hover:bg-card/70 border-white/[0.06] backdrop-blur-sm transition-all duration-500">
				<Card.CardHeader class="p-6">
					<div class="border-terracotta/20 bg-terracotta/10 mb-3 flex size-10 items-center justify-center rounded-xl border">
						<Cpu class="text-terracotta size-5" />
					</div>
					<Card.CardTitle class="text-lg" style="font-family: var(--font-display);">Bun Runtime</Card.CardTitle>
					<Card.CardDescription class="mt-1 leading-relaxed">Installs in milliseconds, runs in milliseconds. The all-in-one JavaScript toolkit.</Card.CardDescription>
				</Card.CardHeader>
			</Card.Card>

			<!-- Bottom spanning: Component count -->
			<Card.Card class="group bg-card/50 hover:border-amber/20 hover:bg-card/70 overflow-hidden border-white/[0.06] backdrop-blur-sm transition-all duration-500 md:col-span-2">
				<Card.CardContent class="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center">
					<div>
						<p class="text-amber text-4xl font-bold" style="font-family: var(--font-display);">50+</p>
						<p class="text-muted-foreground mt-1 text-sm">Accessible shadcn-svelte components ready to use</p>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each ['Button', 'Card', 'Tabs', 'Badge', 'Avatar', 'Switch', 'Tooltip', 'Dialog', 'Dropdown', 'Sheet'] as comp}
							<Badge variant="outline" class="bg-secondary/30 text-muted-foreground hover:border-amber/20 hover:text-amber border-white/[0.06] transition-colors">
								{comp}
							</Badge>
						{/each}
						<Badge class="border-amber/20 bg-amber/10 text-amber">
							+40 more
							<ChevronRight class="ml-0.5 size-3" />
						</Badge>
					</div>
				</Card.CardContent>
			</Card.Card>
		</div>
	</section>

	<!-- ========== REMOTE QUERIES SHOWCASE ========== -->
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="relative flex items-center py-4">
			<Separator class="flex-1 bg-white/[0.06]" />
			<span class="text-muted-foreground/50 mx-4 shrink-0 text-[10px] font-medium tracking-[0.2em] uppercase">Live Demo</span>
			<Separator class="flex-1 bg-white/[0.06]" />
		</div>
	</div>

	<section id="queries" class="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
		{#if showEffects}
			<div class="pointer-events-none absolute top-1/2 right-0 size-[400px] -translate-y-1/2 rounded-full opacity-[0.05] blur-[100px]" style="background: var(--terracotta);"></div>
		{/if}

		<div class="relative">
			<div class="mb-14 max-w-xl">
				<Badge class="border-terracotta/20 bg-terracotta/10 text-terracotta mb-4">
					<Radio class="mr-1 size-3" />
					Realtime
				</Badge>
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl" style="font-family: var(--font-display);">
					Live, with just <span class="text-muted-foreground italic">Postgres</span>
				</h2>
				<p class="text-muted-foreground mt-4 text-lg leading-relaxed">
					A <code class="text-amber font-mono text-base">query.live</code> streams over Postgres LISTEN/NOTIFY — no extra services. Send a message below, then open this page in a second tab and watch it appear in both, instantly.
				</p>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				<!-- SSR: getTags() -->
				<Card.Card class="group bg-card/50 hover:border-copper/20 hover:bg-card/70 overflow-hidden border-white/[0.06] backdrop-blur-sm transition-all duration-500">
					<Card.CardHeader class="p-6 pb-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="border-copper/20 bg-copper/10 flex size-10 items-center justify-center rounded-xl border">
									<Server class="text-copper size-5" />
								</div>
								<div>
									<Card.CardTitle class="text-base" style="font-family: var(--font-display);">Server-Side Data</Card.CardTitle>
									<p class="text-muted-foreground mt-0.5 font-mono text-xs">getTags()</p>
								</div>
							</div>
							<Badge variant="outline" class="border-green-400/20 text-xs text-green-400/80">SSR</Badge>
						</div>
					</Card.CardHeader>
					<Card.CardContent class="p-6 pt-0">
						<p class="text-muted-foreground mb-4 text-sm">Resolved on the server before the page renders. Zero client-side loading.</p>
						<div class="bg-secondary/30 rounded-lg border border-white/[0.06] p-4">
							<p class="text-muted-foreground/60 mb-2.5 text-xs tracking-wider uppercase">Response</p>
							<div class="flex flex-wrap gap-1.5">
								{#each await getTags() as tag}
									<Badge class="border-amber/20 bg-amber/10 text-amber">{tag}</Badge>
								{/each}
							</div>
						</div>
					</Card.CardContent>
				</Card.Card>

				<!-- Realtime: liveMessages() + sendMessage() -->
				<Card.Card class="group bg-card/50 hover:border-terracotta/20 hover:bg-card/70 overflow-hidden border-white/[0.06] backdrop-blur-sm transition-all duration-500">
					<Card.CardHeader class="p-6 pb-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="border-terracotta/20 bg-terracotta/10 flex size-10 items-center justify-center rounded-xl border">
									<Radio class="text-terracotta size-5" />
								</div>
								<div>
									<Card.CardTitle class="text-base" style="font-family: var(--font-display);">Live Messages</Card.CardTitle>
									<p class="text-muted-foreground mt-0.5 font-mono text-xs">query.live</p>
								</div>
							</div>
							{#if chat.connected}
								<Badge variant="outline" class="border-green-400/20 text-xs text-green-400/80">
									<span class="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-green-400"></span>
									Live
								</Badge>
							{:else}
								<Badge variant="outline" class="text-muted-foreground border-white/10 text-xs">Connecting…</Badge>
							{/if}
						</div>
					</Card.CardHeader>
					<Card.CardContent class="p-6 pt-0">
						<div class="bg-secondary/30 rounded-lg border border-white/[0.06] p-4">
							<p class="text-muted-foreground/60 mb-2.5 text-xs tracking-wider uppercase">Stream</p>
							<div class="flex max-h-44 min-h-[5rem] flex-col gap-2 overflow-y-auto">
								{#if chat.error}
									<div class="text-destructive flex items-center gap-2">
										<AlertCircle class="size-4 shrink-0" />
										<span class="text-sm">Stream error — check the server connection</span>
									</div>
								{:else if chat.current === undefined}
									<div class="text-muted-foreground flex items-center gap-2">
										<Loader class="size-4 animate-spin" />
										<span class="text-sm">Connecting…</span>
									</div>
								{:else if chat.current.length === 0}
									<p class="text-muted-foreground/60 text-sm">No messages yet — send the first one.</p>
								{:else}
									{#each chat.current as msg (msg.id)}
										<div class="text-sm">
											<span class="text-amber font-medium">{msg.author}</span>
											<span class="text-foreground">{msg.text}</span>
										</div>
									{/each}
								{/if}
							</div>
						</div>
						<form
							class="mt-4 flex gap-2"
							onsubmit={(e) => {
								e.preventDefault();
								send();
							}}
						>
							<Input
								bind:value={draft}
								placeholder="Type a message…"
								maxlength={500}
								class="bg-secondary/30 placeholder:text-muted-foreground/40 focus:border-terracotta/30 focus:ring-terracotta/20 border-white/[0.06]"
							/>
							<Button type="submit" disabled={!draft.trim()} class="from-terracotta to-copper text-primary-foreground border-0 bg-gradient-to-r hover:opacity-90">
								<Send class="size-3.5" />
							</Button>
						</form>
					</Card.CardContent>
				</Card.Card>
			</div>
		</div>
	</section>

	<!-- ========== AI SEPARATOR ========== -->
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="relative flex items-center py-4">
			<Separator class="flex-1 bg-white/[0.06]" />
			<span class="text-muted-foreground/50 mx-4 shrink-0 text-[10px] font-medium tracking-[0.2em] uppercase">Local AI</span>
			<Separator class="flex-1 bg-white/[0.06]" />
		</div>
	</div>

	<!-- ========== AI SECTION ========== -->
	<section id="ai" class="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
		{#if showEffects}
			<div class="pointer-events-none absolute top-1/3 right-0 size-[400px] -translate-y-1/2 rounded-full opacity-[0.05] blur-[100px]" style="background: var(--amber);"></div>
		{/if}

		<div class="relative grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
			<!-- Left: explanation -->
			<div class="lg:sticky lg:top-24">
				<Badge class="border-amber/20 bg-amber/10 text-amber mb-4">
					<Cpu class="mr-1 size-3" />
					On-device AI
				</Badge>
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl" style="font-family: var(--font-display);">
					AI that never leaves <span class="text-muted-foreground italic">the device</span>
				</h2>
				<p class="text-muted-foreground mt-4 text-lg leading-relaxed">
					The model runs in your browser on the GPU via WebGPU/WebLLM — no API keys, no server
					round-trip, nothing sent anywhere. Pick a model, it downloads once and is cached, then you
					chat. Private and GDPR-friendly by construction, with escalation to external providers on the roadmap.
				</p>
				<div class="mt-6 space-y-3">
					{#each ['Runs locally on WebGPU — private by default', 'Curated, up-to-date models (Qwen3.5, Ministral-3, gemma3)', 'Weights cached after the first download', 'Composable — one chat widget over a shared engine'] as feature}
						<div class="text-muted-foreground flex items-center gap-2.5 text-sm">
							<div class="bg-amber/10 flex size-5 items-center justify-center rounded-full">
								<Check class="text-amber size-3" />
							</div>
							{feature}
						</div>
					{/each}
				</div>
				<Button href="/ai" variant="outline" class="hover:border-amber/20 hover:bg-amber/[0.04] mt-7 border-white/10">
					Open the full page
					<ArrowRight class="ml-1.5 size-4" />
				</Button>
			</div>

			<!-- Right: inline chat over the shared engine -->
			<Chat />
		</div>
	</section>

	<!-- ========== FORM SHOWCASE ========== -->
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="relative flex items-center py-4">
			<Separator class="flex-1 bg-white/[0.06]" />
			<span class="text-muted-foreground/50 mx-4 shrink-0 text-[10px] font-medium tracking-[0.2em] uppercase">Forms</span>
			<Separator class="flex-1 bg-white/[0.06]" />
		</div>
	</div>

	<section id="forms" class="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
		{#if showEffects}
			<div class="pointer-events-none absolute top-1/3 left-0 size-[350px] rounded-full opacity-[0.05] blur-[100px]" style="background: var(--amber);"></div>
		{/if}

		<div class="relative grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
			<!-- Left: Description -->
			<div class="lg:sticky lg:top-24">
				<Badge class="border-amber/20 bg-amber/10 text-amber mb-4">
					<Mail class="mr-1 size-3" />
					SuperForms
				</Badge>
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl" style="font-family: var(--font-display);">
					Forms that <span class="text-muted-foreground italic">just work</span>
				</h2>
				<p class="text-muted-foreground mt-4 text-lg leading-relaxed">
					Server-side validation with Zod, client-side reactivity with SuperForms. No page reloads, instant feedback, type-safe end to end.
				</p>
				<div class="mt-6 space-y-3">
					{#each ['Zod schema validation', 'Progressive enhancement', 'Reactive error states', 'No page reload on submit'] as feature}
						<div class="text-muted-foreground flex items-center gap-2.5 text-sm">
							<div class="bg-amber/10 flex size-5 items-center justify-center rounded-full">
								<Check class="text-amber size-3" />
							</div>
							{feature}
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: Form -->
			<Card.Card class="bg-card/50 overflow-hidden border-white/[0.06] backdrop-blur-sm">
				<Card.CardHeader class="p-6 pb-0">
					<div class="mb-1 flex items-center gap-2">
						<div class="bg-terracotta size-2.5 rounded-full"></div>
						<div class="bg-amber size-2.5 rounded-full"></div>
						<div class="size-2.5 rounded-full bg-green-500/60"></div>
						<span class="text-muted-foreground ml-2 font-mono text-xs">contact-form.svelte</span>
					</div>
				</Card.CardHeader>
				<Card.CardContent class="p-6">
					{#if $message}
						<div class="mb-4 rounded-lg bg-green-500/10 p-4 text-green-500">
							{$message}
						</div>
					{/if}
					<form method="POST" use:enhance>
						<Field.Group>
							<Field.Set>
								<Field.Legend class="text-foreground text-lg" style="font-family: var(--font-display);">Get in touch</Field.Legend>
								<Field.Description class="text-muted-foreground">Send us a message and we'll get back to you.</Field.Description>
								<Field.Group>
									<Field.Field>
										<Field.Label class="text-muted-foreground text-sm">Name</Field.Label>
										<Input
											type="text"
											placeholder="Your name"
											name="name"
											bind:value={$form.name}
											class="bg-secondary/30 placeholder:text-muted-foreground/40 focus:border-amber/30 focus:ring-amber/20 border-white/[0.06]"
										/>
										{#if $errors.name}
											<Field.Error>{$errors.name}</Field.Error>
										{/if}
									</Field.Field>
									<Field.Field>
										<Field.Label class="text-muted-foreground text-sm">E-Mail</Field.Label>
										<Input
											type="email"
											placeholder="you@example.com"
											name="email"
											bind:value={$form.email}
											class="bg-secondary/30 placeholder:text-muted-foreground/40 focus:border-amber/30 focus:ring-amber/20 border-white/[0.06]"
										/>
										{#if $errors.email}
											<Field.Error>{$errors.email}</Field.Error>
										{/if}
									</Field.Field>
									<Field.Field>
										<Field.Label class="text-muted-foreground text-sm">Message</Field.Label>
										<Input
											type="text"
											placeholder="What's on your mind?"
											name="message"
											bind:value={$form.message}
											class="bg-secondary/30 placeholder:text-muted-foreground/40 focus:border-amber/30 focus:ring-amber/20 border-white/[0.06]"
										/>
										{#if $errors.message}
											<Field.Error>{$errors.message}</Field.Error>
										{/if}
									</Field.Field>
								</Field.Group>
								<Field.Field orientation="horizontal">
									<Button type="submit" class="from-amber to-copper text-primary-foreground border-0 bg-gradient-to-r hover:opacity-90">
										<Send class="mr-1.5 size-3.5" />
										Submit
									</Button>
									<Button variant="outline" type="button" class="border-white/10 hover:border-white/20 hover:bg-white/[0.04]">Cancel</Button>
								</Field.Field>
							</Field.Set>
						</Field.Group>
					</form>
				</Card.CardContent>
			</Card.Card>
		</div>
	</section>

	<!-- ========== CTA ========== -->
	<section id="cta" class="relative mx-auto max-w-6xl px-6 py-32 lg:px-8">
		{#if showEffects}
			<div class="pointer-events-none absolute inset-0 opacity-[0.08]" style="background: radial-gradient(ellipse at center, var(--amber), transparent 70%);"></div>
		{/if}

		<div class="relative text-center">
			<h2 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style="font-family: var(--font-display);">
				Start <span class="text-muted-foreground italic">building</span>
				<br />
				<span class="from-amber via-copper to-terracotta bg-gradient-to-r bg-clip-text text-transparent"> something great </span>
			</h2>
			<p class="text-muted-foreground mx-auto mt-5 max-w-md text-lg">Clone the repo, install with Bun, and ship your first feature in minutes.</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<Button
					size="lg"
					class="from-amber via-copper to-terracotta text-primary-foreground border-0 bg-gradient-to-r px-8 text-base hover:opacity-90"
					href="https://github.com/Georg97/basedstack"
					target="_blank"
				>
					<Github class="mr-2 size-4" />
					Clone the repo
				</Button>
				<Button variant="ghost" size="lg" class="text-muted-foreground hover:text-foreground text-base">
					Read the docs
					<ArrowRight class="ml-1.5 size-4" />
				</Button>
			</div>
		</div>
	</section>

	<!-- ========== FOOTER ========== -->
	<footer class="border-t border-white/[0.04]">
		<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-8">
			<div class="text-muted-foreground/60 flex items-center gap-2 text-sm">
				<div class="from-amber/40 to-terracotta/40 flex size-5 items-center justify-center rounded bg-gradient-to-br">
					<Layers class="text-muted-foreground size-3" />
				</div>
				<span>basedstack</span>
			</div>
			<nav class="text-muted-foreground/60 flex items-center gap-5 text-xs">
				<a href="/legal/privacy" class="hover:text-foreground transition-colors">Privacy</a>
				<a href="/legal/imprint" class="hover:text-foreground transition-colors">Imprint</a>
				<a href="/account/privacy" class="hover:text-foreground transition-colors">Your data</a>
			</nav>
			<p class="text-muted-foreground/40 text-xs">Built with SvelteKit, Tailwind & shadcn-svelte</p>
		</div>
	</footer>
</div>
