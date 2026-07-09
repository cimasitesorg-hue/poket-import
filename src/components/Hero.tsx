import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "@phosphor-icons/react";
import { Logo } from "./Logo";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // Parallax sutil: el resplandor de fondo se mueve más lento que el scroll
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  return (
    <header ref={ref} className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={reduce ? undefined : { y: glowY, opacity: glowOpacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 60% at 80% 95%, color-mix(in oklch, var(--color-copper) 18%, transparent) 0%, transparent 60%), radial-gradient(70% 50% at 10% 20%, color-mix(in oklch, var(--color-copper-deep) 9%, transparent) 0%, transparent 55%)",
          }}
        />
      </motion.div>

      <nav className="hero-in relative flex items-center justify-between px-5 pt-5 md:px-10" style={{ "--i": 0 } as React.CSSProperties}>
        <a href="#" aria-label="Poket Import, inicio" className="pressable -ml-1 block p-1 text-ink">
          <Logo variant="mark" className="h-10 w-auto" />
        </a>
        <a
          href="#catalogo"
          className="pressable rounded-full border border-line px-4 py-2 text-sm text-ink-muted hover:border-copper hover:text-ink"
        >
          Catálogo
        </a>
      </nav>

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 pb-24 md:px-10">
        <Logo animated className="w-36 text-ink md:w-44" />
        <h1
          className="hero-in mt-8 max-w-[14ch] pb-1 text-5xl leading-[1.1] font-medium md:max-w-[22ch] md:text-7xl"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          Fragancias que se quedan en la <em className="text-copper italic">piel</em>.
        </h1>
        <p
          className="hero-in mt-6 max-w-[42ch] text-lg text-ink-muted md:text-xl"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          Stock importado real: Lattafa, Afnan, Rasasi, Armaf. Elegí el tuyo y te asesoramos por
          WhatsApp.
        </p>
        <div className="hero-in mt-10" style={{ "--i": 4 } as React.CSSProperties}>
          <a
            href="#catalogo"
            className="pressable group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-copper px-7 py-3 text-base font-medium text-bg hover:bg-copper-deep"
          >
            Ver el catálogo
            <ArrowDown
              size={18}
              weight="bold"
              className="transition-transform duration-300 ease-out-expo motion-safe:group-hover:translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
