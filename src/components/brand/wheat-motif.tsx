import { Wheat } from "lucide-react";

/** Decorative wheat ring for hero — reads as “harvest / local food” without raster assets. */
export function WheatMotif() {
  return (
    <div
      className="relative flex h-[min(280px,55vw)] w-[min(280px,55vw)] max-w-[320px] items-center justify-center rounded-full border border-white/18 bg-white/[0.08] shadow-inner backdrop-blur-[2px] md:h-72 md:w-72"
      aria-hidden
    >
      <div className="absolute inset-4 rounded-full border border-white/12" />
      <div className="absolute inset-10 rounded-full border border-white/10" />
      <Wheat className="animate-wheat-drift absolute left-[18%] top-[28%] h-14 w-14 text-white/38" strokeWidth={1.25} />
      <Wheat className="animate-wheat-drift absolute right-[20%] top-[22%] h-16 w-16 text-white/28 [animation-delay:-2s]" strokeWidth={1.25} />
      <Wheat className="animate-wheat-drift absolute bottom-[26%] left-1/2 h-20 w-20 -translate-x-1/2 text-[#cfe4ff]/45 [animation-delay:-4s]" strokeWidth={1.25} />
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.1] ring-1 ring-white/18">
        <Wheat className="h-12 w-12 text-white/45" strokeWidth={1.5} />
      </div>
    </div>
  );
}
