import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      tone: {
        seal: "bg-seal text-paper hover:bg-seal/90",
        line: "border border-line bg-sheet text-ink hover:border-stone",
        ghost: "bg-transparent text-ink hover:bg-line/70",
      },
    },
    defaultVariants: { tone: "line" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, tone, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ tone }), className)} {...props} />;
}
