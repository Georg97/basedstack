<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { authClient } from '$lib/auth-client';
	import { toast } from 'svelte-sonner';
	import Layers from '@lucide/svelte/icons/layers';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';
	import User from '@lucide/svelte/icons/user';
	import Loader from '@lucide/svelte/icons/loader';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';

	let mode = $state<'signin' | 'signup'>('signin');
	let loading = $state(false);
	let googleLoading = $state(false);
	let showPassword = $state(false);

	let name = $state('');
	let email = $state('');
	let password = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		try {
			if (mode === 'signup') {
				const { error } = await authClient.signUp.email({
					email,
					password,
					name
				});
				if (error) {
					toast.error(error.message || 'Sign up failed');
				} else {
					toast.success('Account created!', { description: 'Welcome to basedstack.' });
				}
			} else {
				const { error } = await authClient.signIn.email({
					email,
					password
				});
				if (error) {
					toast.error(error.message || 'Sign in failed');
				} else {
					toast.success('Welcome back!');
				}
			}
		} catch {
			toast.error('Something went wrong. Please try again.');
		} finally {
			loading = false;
		}
	}

	async function handleGoogle() {
		googleLoading = true;
		try {
			await authClient.signIn.social({ provider: 'google' });
		} catch {
			toast.error('Google sign in failed');
			googleLoading = false;
		}
	}

	function toggleMode() {
		mode = mode === 'signin' ? 'signup' : 'signin';
		name = '';
		email = '';
		password = '';
	}
</script>

<svelte:head>
	<title>{mode === 'signin' ? 'Sign In' : 'Sign Up'} — basedstack</title>
</svelte:head>

<div class="grain relative flex min-h-screen">
	<!-- ========== LEFT: Brand Panel ========== -->
	<div class="relative hidden overflow-hidden lg:flex lg:w-[45%] xl:w-[50%]">
		<!-- Layered gradient background -->
		<div class="absolute inset-0" style="background: linear-gradient(145deg, oklch(0.12 0.02 45), oklch(0.18 0.015 55), oklch(0.14 0.02 35));"></div>

		<!-- Animated orbs -->
		<div
			class="animate-float-slower pointer-events-none absolute -top-20 -left-20 size-[450px] rounded-full opacity-25 blur-[100px]"
			style="background: radial-gradient(circle, var(--amber), transparent 70%);"
		></div>
		<div
			class="animate-float-slow pointer-events-none absolute -right-16 bottom-1/4 size-[350px] rounded-full opacity-20 blur-[90px]"
			style="background: radial-gradient(circle, var(--terracotta), transparent 70%);"
		></div>
		<div
			class="pointer-events-none absolute top-1/2 left-1/3 size-[300px] -translate-y-1/2 rounded-full opacity-[0.08] blur-[70px]"
			style="background: radial-gradient(circle, var(--copper), transparent 60%);"
		></div>

		<!-- Grid pattern -->
		<div
			class="pointer-events-none absolute inset-0 opacity-[0.025]"
			style="background-image: linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px); background-size: 50px 50px;"
		></div>

		<!-- Diagonal decorative lines -->
		<div class="pointer-events-none absolute inset-0 opacity-[0.04]">
			<div class="absolute top-0 right-0 h-full w-px origin-top-right rotate-[15deg]" style="background: linear-gradient(to bottom, transparent, var(--amber), transparent);"></div>
			<div class="absolute top-0 right-24 h-full w-px origin-top-right rotate-[15deg]" style="background: linear-gradient(to bottom, transparent, var(--copper) 60%, transparent);"></div>
		</div>

		<!-- Content -->
		<div class="relative z-10 flex flex-col justify-between p-12 xl:p-16">
			<!-- Logo -->
			<a href="/" class="group flex items-center gap-3" style="font-family: var(--font-display);">
				<div class="from-amber to-terracotta flex size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-amber/10">
					<Layers class="size-5 text-white" />
				</div>
				<span class="text-xl font-semibold tracking-tight">
					<span class="group-hover:text-amber transition-colors">based</span><span class="text-muted-foreground">stack</span>
				</span>
			</a>

			<!-- Center message -->
			<div class="max-w-sm">
				<h1
					class="animate-fade-up text-4xl leading-[1.1] font-bold tracking-tight xl:text-5xl"
					style="font-family: var(--font-display);"
				>
					Build
					<span class="from-amber via-copper to-terracotta bg-gradient-to-r bg-clip-text text-transparent">
						something
					</span>
					<br />
					<span class="italic text-muted-foreground">remarkable</span>.
				</h1>
				<p
					class="animate-fade-up text-muted-foreground mt-5 text-base leading-relaxed xl:text-lg"
					style="animation-delay: 0.1s;"
				>
					Your full-stack starting point. Sign in to access your projects and start shipping.
				</p>
			</div>

			<!-- Bottom decorative badges -->
			<div class="animate-fade-up flex flex-wrap gap-2" style="animation-delay: 0.2s;">
				<Badge class="border-amber/20 bg-amber/10 text-amber">SvelteKit</Badge>
				<Badge class="border-copper/20 bg-copper/10 text-copper">Tailwind</Badge>
				<Badge class="border-terracotta/20 bg-terracotta/10 text-terracotta">shadcn</Badge>
				<Badge variant="outline" class="border-white/10 text-muted-foreground">TypeScript</Badge>
			</div>
		</div>
	</div>

	<!-- ========== RIGHT: Auth Form ========== -->
	<div class="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
		<!-- Mobile logo -->
		<a href="/" class="mb-10 flex items-center gap-2.5 lg:hidden" style="font-family: var(--font-display);">
			<div class="from-amber to-terracotta flex size-9 items-center justify-center rounded-xl bg-gradient-to-br">
				<Layers class="size-4.5 text-white" />
			</div>
			<span class="text-lg font-semibold tracking-tight">
				<span>based</span><span class="text-muted-foreground">stack</span>
			</span>
		</a>

		<div class="w-full max-w-sm">
			<!-- Header -->
			<div class="animate-fade-up mb-8">
				<h2
					class="text-2xl font-bold tracking-tight sm:text-3xl"
					style="font-family: var(--font-display);"
				>
					{#if mode === 'signin'}
						Welcome <span class="italic text-muted-foreground">back</span>
					{:else}
						Create your <span class="from-amber to-copper bg-gradient-to-r bg-clip-text text-transparent">account</span>
					{/if}
				</h2>
				<p class="text-muted-foreground mt-2 text-sm">
					{#if mode === 'signin'}
						Sign in to continue to your dashboard.
					{:else}
						Get started with basedstack in seconds.
					{/if}
				</p>
			</div>

			<!-- Google OAuth -->
			<div class="animate-fade-up" style="animation-delay: 0.1s;">
				<Button
					variant="outline"
					class="group h-11 w-full border-white/[0.08] bg-white/[0.03] text-sm hover:border-amber/20 hover:bg-amber/[0.04]"
					onclick={handleGoogle}
					disabled={googleLoading}
				>
					{#if googleLoading}
						<Loader class="mr-2 size-4 animate-spin" />
					{:else}
						<svg class="mr-2 size-4" viewBox="0 0 24 24" fill="none">
							<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
							<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
							<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
							<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
						</svg>
					{/if}
					Continue with Google
				</Button>
			</div>

			<!-- Divider -->
			<div class="animate-fade-up relative my-7 flex items-center" style="animation-delay: 0.15s;">
				<Separator class="flex-1 bg-white/[0.06]" />
				<span class="text-muted-foreground/40 mx-4 text-xs tracking-widest uppercase">or</span>
				<Separator class="flex-1 bg-white/[0.06]" />
			</div>

			<!-- Email form -->
			<form onsubmit={handleSubmit} class="animate-fade-up" style="animation-delay: 0.2s;">
				<div class="space-y-4">
					<!-- Name field (signup only) -->
					{#if mode === 'signup'}
						<div class="animate-fade-up">
							<Field.Field>
								<Field.Label class="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Name</Field.Label>
								<div class="relative">
									<User class="text-muted-foreground/40 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
									<Input
										type="text"
										placeholder="Your name"
										name="name"
										bind:value={name}
										required
										class="bg-secondary/30 placeholder:text-muted-foreground/30 focus:border-amber/30 focus:ring-amber/20 h-11 border-white/[0.06] pl-10"
									/>
								</div>
							</Field.Field>
						</div>
					{/if}

					<!-- Email -->
					<Field.Field>
						<Field.Label class="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Email</Field.Label>
						<div class="relative">
							<Mail class="text-muted-foreground/40 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
							<Input
								type="email"
								placeholder="you@example.com"
								name="email"
								bind:value={email}
								required
								class="bg-secondary/30 placeholder:text-muted-foreground/30 focus:border-amber/30 focus:ring-amber/20 h-11 border-white/[0.06] pl-10"
							/>
						</div>
					</Field.Field>

					<!-- Password -->
					<Field.Field>
						<div class="mb-1.5 flex items-center justify-between">
							<Field.Label class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Password</Field.Label>
							{#if mode === 'signin'}
								<button type="button" class="text-amber/70 hover:text-amber text-xs transition-colors">Forgot?</button>
							{/if}
						</div>
						<div class="relative">
							<Lock class="text-muted-foreground/40 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
							<Input
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								name="password"
								bind:value={password}
								required
								class="bg-secondary/30 placeholder:text-muted-foreground/30 focus:border-amber/30 focus:ring-amber/20 h-11 border-white/[0.06] pr-10 pl-10"
							/>
							<button
								type="button"
								class="text-muted-foreground/40 hover:text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
								onclick={() => (showPassword = !showPassword)}
							>
								{#if showPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</div>
					</Field.Field>
				</div>

				<!-- Submit -->
				<Button
					type="submit"
					class="from-amber via-copper to-terracotta text-primary-foreground mt-6 h-11 w-full border-0 bg-gradient-to-r text-sm font-medium hover:opacity-90"
					disabled={loading}
				>
					{#if loading}
						<Loader class="mr-2 size-4 animate-spin" />
					{/if}
					{mode === 'signin' ? 'Sign In' : 'Create Account'}
					<ArrowRight class="ml-1.5 size-4" />
				</Button>
			</form>

			<!-- Toggle mode -->
			<p class="animate-fade-up text-muted-foreground mt-7 text-center text-sm" style="animation-delay: 0.25s;">
				{#if mode === 'signin'}
					Don't have an account?
					<button class="text-amber hover:text-amber/80 ml-1 font-medium transition-colors" onclick={toggleMode}>
						Sign up
					</button>
				{:else}
					Already have an account?
					<button class="text-amber hover:text-amber/80 ml-1 font-medium transition-colors" onclick={toggleMode}>
						Sign in
					</button>
				{/if}
			</p>

			<!-- Terms -->
			<p class="text-muted-foreground/30 mt-6 text-center text-[11px] leading-relaxed">
				By continuing, you agree to our Terms of Service and Privacy Policy.
			</p>
		</div>
	</div>
</div>
