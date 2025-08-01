import tmuLogo from '@/assets/tmu-monkey-logo.png';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground">
      <img src={tmuLogo.src} alt="Logo" className="h-45 w-45 animate-bounce" />
      <span className="text-3xl font-bold text-secondary animate-pulse">
        Loading Content...
      </span>
    </div>
  );
}
