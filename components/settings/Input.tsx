export default function Input({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-foreground">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background focus:ring-1 focus:ring-foreground/10 focus:border-foreground transition-all outline-none text-sm font-medium"
      />
    </div>
  );
}
