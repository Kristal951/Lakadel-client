export default function Spinner({w, h}: {w: string, h:string}) {
  return (
    <div className="flex items-center justify-center">
      <div className={`h-${h} w-${w} animate-spin rounded-full border-3 border-background border-t-foreground`} />
    </div>
  );
}
