import { ConsentGate } from "@/components/consent/ConsentGate";
import { tl } from "@/locales/tl";

export default function Page() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-14 md:flex-row md:items-center md:gap-20 md:px-12 md:pt-0">

      {/* Left — brand + copy */}
      <div className="mb-10 flex flex-col md:mb-0 md:flex-1 animate-fade-up [animation-fill-mode:both]">
        <div className="mb-5 flex items-baseline gap-0.5">
          <span className="text-[52px] font-[800] leading-none tracking-tight text-fg">
            sana
          </span>
          <span className="text-[52px] font-[800] leading-none tracking-tight text-accent-fg">
            .AI
          </span>
        </div>

        <p className="text-[22px] font-[700] leading-snug tracking-tight text-fg">
          {tl.landing.headline}
        </p>

        <p className="mt-3 text-[16px] leading-relaxed text-fg-muted">
          {tl.landing.sub}
        </p>

        <div className="mt-8 hidden md:flex flex-col gap-2 text-[13px] text-fg-subtle">
          <span>✦ Free to use</span>
          <span>✦ No account required</span>
          <span>✦ Your data stays yours</span>
        </div>
      </div>

      {/* Right — consent + CTA */}
      <div className="flex w-full flex-col md:w-[400px] animate-fade-up [animation-delay:80ms] [animation-fill-mode:both]">
        <ConsentGate />
      </div>

      <footer className="absolute bottom-5 left-6 text-[12px] text-fg-subtle">
        sana.AI · Hackathon build · Demo mode
      </footer>
    </main>
  );
}
