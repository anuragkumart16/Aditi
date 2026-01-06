import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="absolute -top-[20%] left-0 right-0 h-[500px] w-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black opacity-70 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 top-0 h-full w-full bg-[url('/grid.svg')] bg-[size:50px_50px] opacity-[0.1] pointer-events-none" />

      <main className="z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center">

        {/* Logo / Badge */}
        <div className="animate-fade-in flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-md transition-colors hover:bg-white/10">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
          </span>
          <span>Next-Generation AI Agent</span>
        </div>

        {/* Hero Text */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="bg-linear-to-br from-white via-white to-white/50 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl lg:text-8xl">
            Aditi AI
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Experience the future of conversation. A professional studio-quality
            AI assistant designed to help you achieve more with clarity and precision.
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/api/auth/github"
            className="group relative flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:bg-zinc-200 hover:ring-2 hover:ring-white/20 active:scale-95"
          >
            <Github className="h-4 w-4" />
            <span>Login with GitHub</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          
        </div>

        {/* Footer / Trust */}
        <div className="mt-16 flex flex-col items-center gap-4 text-xs text-zinc-500">
         
        </div>
      </main>
    </div>
  );
}
