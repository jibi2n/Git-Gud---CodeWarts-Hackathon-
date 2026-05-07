import { ConsentGate } from "@/components/consent/ConsentGate";
import { tl } from "@/locales/tl";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

      <footer className="mt-auto flex flex-col gap-3 pt-10 text-[12px] text-fg-subtle">
        <Link
          href="/modules"
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "min-h-[56px] text-[17px]"
          )}
        >
          Open modules (welding demo)
        </Link>
        <div>San.AI · Hackathon build · Demo mode</div>
      </footer>
    </main>
  );
}
