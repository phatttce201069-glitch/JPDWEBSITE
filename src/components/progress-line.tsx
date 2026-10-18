export function ProgressLine({ value, max }: { value: number; max: number }) {
  const ratio = max === 0 ? 0 : Math.min(1, value / max);
  return (
    <div className="h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
      <div className="h-full bg-seal transition-[width] duration-200" style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}
