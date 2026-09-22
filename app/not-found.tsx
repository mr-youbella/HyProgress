import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
	return (
		<main className="flex min-h-screen items-center bg-[#0B0B0F] px-5 py-10 text-stone-100 sm:px-8">
			<section className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center shadow-2xl shadow-black/20 sm:p-10">
				<div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
					<SearchX aria-hidden="true" className="size-6" />
				</div>

				<p className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
					Error 404
				</p>
				<h1 className="mt-3 font-['Fraunces'] text-3xl font-semibold tracking-tight sm:text-4xl">
					Page not found
				</h1>
				<p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-400">
					This page does not exist, or its link may be incorrect.
				</p>

				<Link
					className="mt-7 inline-flex items-center gap-2 rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/20 hover:text-emerald-200"
					href="/"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Back to search
				</Link>
			</section>
		</main>
	);
}
