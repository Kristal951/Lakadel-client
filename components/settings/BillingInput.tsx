export default function BillingInput({ label, icon, ...props }: any) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-xs uppercase tracking-wide font-semibold text-foreground/60 group-focus-within:text-foreground transition-colors">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 group-focus-within:text-foreground transition-colors">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full ${icon ? 'pl-11' : 'px-4'} py-3.5 rounded-xl border border-foreground/20 bg-background focus:ring-1 focus:ring-foreground/10 focus:border-foreground transition-all outline-none text-sm text-foreground placeholder:text-forground/60 shadow-sm`}
        />
      </div>
    </div>
  );
}
