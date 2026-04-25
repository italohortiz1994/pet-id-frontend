"use client";

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function PetsError({ error, reset }: ErrorPageProps) {
  return (
    <div className="glass-panel px-6 py-10">
      <span className="eyebrow">Erro</span>
      <h2 className="mt-3 text-2xl font-semibold">Nao foi possivel carregar os dados</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        {error.message || "Verifique se o back-end esta no ar e se NEXT_PUBLIC_API_URL esta correta."}
      </p>
      <button className="button-primary mt-6" onClick={reset} type="button">
        Tentar novamente
      </button>
    </div>
  );
}
