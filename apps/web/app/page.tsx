import { ConsentGate } from "@/components/consent/ConsentGate";
import { tl } from "@/locales/tl";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-10">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          {tl.app.name}
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-muted">
          {tl.landing.headline}
        </p>
        <p className="mt-2 text-[16px] leading-relaxed text-fg-muted">
          {tl.landing.sub}
        </p>
      </header>

      <ConsentGate />

      <footer className="mt-auto pt-10 text-[13px] text-fg-subtle">
        Boses MDP · Hackathon build · Demo mode
      </footer>
    </main>
  );
}
