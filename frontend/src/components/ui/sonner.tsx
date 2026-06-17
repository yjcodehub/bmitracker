"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-semibold group-[.toaster]:border group-[.toaster]:backdrop-blur-md",
          success: "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-emerald-50/95 dark:group-[.toaster]:bg-emerald-950/20 group-[.toaster]:text-emerald-800 dark:group-[.toaster]:text-emerald-200",
          error: "group-[.toaster]:border-rose-500/30 group-[.toaster]:bg-rose-50/95 dark:group-[.toaster]:bg-rose-950/20 group-[.toaster]:text-rose-800 dark:group-[.toaster]:text-rose-200",
          warning: "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-amber-50/95 dark:group-[.toaster]:bg-amber-950/20 group-[.toaster]:text-amber-800 dark:group-[.toaster]:text-amber-200",
          info: "group-[.toaster]:border-blue-500/30 group-[.toaster]:bg-blue-50/95 dark:group-[.toaster]:bg-blue-950/20 group-[.toaster]:text-blue-800 dark:group-[.toaster]:text-blue-200",
          description: "group-[.toast]:text-muted-foreground text-xs font-normal mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
