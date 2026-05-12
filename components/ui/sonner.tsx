"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      duration={1800}
      visibleToasts={2}
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
        loading: null,
      }}
      style={
        {
          "--normal-bg": "#fffdf4",
          "--normal-text": "#381a55",
          "--normal-border": "#381a55",
          "--border-radius": "30px",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast mx-auto !w-fit !min-w-0 max-w-[calc(100vw-2rem)] justify-center border-[3px] border-[#381a55] bg-[#fffdf4] px-4 py-3 text-center text-[#381a55] shadow-[4px_4px_0_#381a55]",
          title: "toast-pixel-text mx-auto text-center text-sm",
          content: "items-center text-center",
          success: "text-[#145c2d]",
          error: "text-[#8f1741]",
          icon: "hidden",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
