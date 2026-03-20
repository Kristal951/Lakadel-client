'use client'
import { usePathname } from "next/navigation";

export default function BreadCrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span
        className="cursor-pointer"
        style={{ color: "var(--foreground)", opacity: 0.5 }}
      >
        Home
      </span>

      {segments.map((segment, idx) => {
        const isLast = idx === segments.length - 1;
        return (
          <span
            key={idx}
            className="flex items-center space-x-1"
            style={{
              fontWeight: isLast ? 600 : 400,
              color: "var(--foreground)",
              opacity: isLast ? 1 : 0.4,
              cursor: isLast ? "default" : "pointer",
            }}
          >
            <span>›</span>
            <span>{segment.charAt(0).toUpperCase() + segment.slice(1)}</span>
          </span>
        );
      })}
    </div>
  );
}
