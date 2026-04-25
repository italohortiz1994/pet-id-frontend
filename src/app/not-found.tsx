import Link from "next/link";

export default function NotFound() {
  return (
    <div className="glass-panel px-6 py-12 text-center">
      <span className="eyebrow">404</span>
      <h1 className="mt-3 text-3xl font-semibold">Pagina nao encontrada</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        O recurso solicitado nao existe ou nao foi retornado pelo back-end.
      </p>
      <div className="mt-6 flex justify-center">
        <Link href="/pets" className="button-primary">
          Voltar para pets
        </Link>
      </div>
    </div>
  );
}
