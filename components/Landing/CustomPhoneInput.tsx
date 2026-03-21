import React, { forwardRef } from "react";

export const CustomPhoneInput = forwardRef<HTMLInputElement, any>(
  ({ value, onChange, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      value={value || ""}
      onChange={onChange}
      className="w-full h-12 px-3 text-gray-900 placeholder-gray-400 outline-none"
    />
  )
);

CustomPhoneInput.displayName = "CustomPhoneInput";