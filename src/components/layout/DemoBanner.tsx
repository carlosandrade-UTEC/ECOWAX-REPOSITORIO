export function DemoBanner() {
  return (
    <div 
      id="demo-banner"
      className="fixed top-0 left-0 right-0 h-[32px] bg-amber-100 border-b border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center px-4 z-50 tracking-wide select-none"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
      MODO DEMOSTRACIÓN — datos sintéticos, no son resultados operativos de ECOWAX
    </div>
  );
}
