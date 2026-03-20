"use client";
import { Plus, X, Palette } from "lucide-react";
import { useState } from "react";

export default function ColorPicker() {
  // This state represents your Prisma Json field
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [currentHex, setCurrentHex] = useState("#000000");
  const [currentName, setCurrentName] = useState("");

  const addColor = () => {
    if (!currentName.trim()) return;
    const newColor = { name: currentName.trim(), hex: currentHex };
    setColors([...colors, newColor]);
    setCurrentName(""); // Reset name for next entry
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-6 border-t border-foreground/10 pt-8">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-2xl font-bold tracking-tight">Product Colors</h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* Color Input Controls */}
        <div className="flex flex-wrap items-end gap-4 p-4 rounded-2xl bg-muted/5 border border-foreground/10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pick Color</label>
            <div className="flex items-center gap-2 h-12 px-3 rounded-xl border border-foreground/20 bg-background">
              <input
                type="color"
                value={currentHex}
                onChange={(e) => setCurrentHex(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <span className="text-sm font-mono font-bold uppercase">{currentHex}</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Color Name</label>
            <input
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              placeholder="e.g. Space Grey"
              className="w-full h-12 px-4 rounded-xl border border-foreground/20 bg-background outline-none focus:border-foreground transition-all"
            />
          </div>

          <button
            type="button"
            onClick={addColor}
            className="h-12 px-6 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Display Picked Colors (The JSON Preview) */}
        <div className="flex flex-wrap gap-3">
          {colors.map((color, index) => (
            <div
              key={index}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-foreground/10 bg-background shadow-sm animate-in fade-in slide-in-from-bottom-2"
            >
              <div 
                className="w-5 h-5 rounded-full border border-foreground/10" 
                style={{ backgroundColor: color.hex }} 
              />
              <span className="text-xs font-bold">{color.name}</span>
              <button
                type="button"
                onClick={() => removeColor(index)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {colors.length === 0 && (
            <p className="text-xs text-muted-foreground italic ml-1">No colors added yet.</p>
          )}
        </div>
      </div>

      {/* Hidden input to store JSON for form submission */}
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />
    </section>
  );
}