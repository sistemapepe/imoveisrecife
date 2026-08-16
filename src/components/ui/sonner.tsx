import React from "react";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Use a plain object for ref if it's not a valid DOM element, or just omit if Sonner doesn't support it.
// Here we wrap it in a div to safely attach the ref.
export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>((props, ref) => {
  const { theme = "system" } = useTheme();

  return (
    <div ref={ref} className="contents">
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
    </div>
  );
});

Toaster.displayName = "SonnerToaster";