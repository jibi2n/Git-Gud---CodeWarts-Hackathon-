import { ConsentGate } from "@/components/consent/ConsentGate";
import { tl } from "@/locales/tl";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-14">
      <header className="mb-10 animate-fade-up [animation-fill-mode:both]">
        <div className="mb-6 flex items-baseline gap-0.5">
          <span className="text-[42px] font-[800] leading-none tracking-tight text-fg">
            San
          </span>
          <span className="text-[42px] font-[800] leading-none tracking-tight text-accent-fg">
            .AI
          </span>
        </div>
        <p className="text-[22px] font-semibold leading-snug tracking-tight text-fg">
          {tl.landing.headline}
        </p>
        <p className="mt-2 text-[16px] leading-relaxed text-fg-muted">
          {tl.landing.sub}
        </p>
      </header>

      <div className="animate-fade-up [animation-delay:80ms] [animation-fill-mode:both]">
        <ConsentGate />
      </div>

      <footer className="mt-auto pt-10 text-[12px] text-fg-subtle">
        San.AI · Hackathon build · Demo mode
      </footer>
    </main>
  );
}
