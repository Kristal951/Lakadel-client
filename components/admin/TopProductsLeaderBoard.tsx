"use client";

import { Trophy, TrendingUp } from "lucide-react";

type Product = {
  name: string;
  sold: number;
};

export function TopProductsLeaderboard({
  products,
}: {
  products: Product[];
}) {
  const maxSold = Math.max(...products.map((p) => p.sold), 1);

  return (
    <section className="rounded-3xl border border-foreground/10 bg-background p-6">
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Top Products
        </h2>
      </div>

      <div className="space-y-4">
        {products.map((product, i) => {
          const percent = (product.sold / maxSold) * 100;

          return (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-foreground/50 w-5">
                    #{i + 1}
                  </span>

                  <span className="font-medium text-foreground">
                    {product.name}
                  </span>
                </div>

                <span className="text-sm font-semibold text-foreground">
                  {product.sold} sold
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <p className="text-sm text-foreground/40 italic">
            No product sales yet
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-6 text-xs text-foreground/50">
        <TrendingUp className="w-3 h-3" />
        Best performing items
      </div>
    </section>
  );
}