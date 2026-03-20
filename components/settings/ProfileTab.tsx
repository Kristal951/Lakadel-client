"use client";

import React from "react";
import Image from "next/image";
import Input from "./Input";
import useUserStore from "@/store/userStore";

export default function ProfileTab({ user }: { user: any }) {
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  // keep local state in sync when store user loads/updates
  React.useEffect(() => {
    setDisplayName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setAvatarPreview(user?.image ?? null);
  }, [user?.name, user?.email, user?.image]);

  const fallbackAvatar = React.useMemo(() => {
    const n = user?.name?.trim() || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      n,
    )}&background=random&color=fff`;
  }, [user?.name]);

  const src = avatarPreview || fallbackAvatar;

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.currentTarget.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Max 5MB.");
      e.currentTarget.value = "";
      return;
    }

    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  React.useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const onRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.image ?? null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section className="bg-background rounded-4xl border border-foreground/30 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-foreground/30 bg-background">
        <h2 className="text-xl font-bold text-foreground">Public Profile</h2>
        <p className="text-sm text-foreground/60">
          How others will see you on the platform.
        </p>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden">
            <Image
              src={src}
              alt="Avatar Preview"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
              referrerPolicy="no-referrer"
              priority
              unoptimized={src.includes("googleusercontent.com")}
            />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPickFile}
              className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Change Avatar
            </button>

            {avatarFile && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Undo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Display Name"
            placeholder="John Doe"
            value={displayName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDisplayName(e.target.value)
            }
          />
          <Input
            label="Email Address"
            placeholder="johndoe@gmail.com"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </div>

        {avatarFile && (
          <p className="text-xs text-foreground/60">
            Avatar selected. Remember to save changes to upload it.
          </p>
        )}
      </div>
    </section>
  );
}
