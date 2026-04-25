"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

export function SubmitButton({ children, variant = "primary" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const className =
    variant === "secondary"
      ? "button-secondary"
      : variant === "danger"
        ? "button-secondary danger-button"
        : "button-primary";

  return (
    <button className={className} type="submit" disabled={pending}>
      {pending ? "Salvando..." : children}
    </button>
  );
}
