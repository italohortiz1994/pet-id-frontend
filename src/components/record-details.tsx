import { flattenRecord, humanizeKey } from "@/lib/records";

type RecordDetailsProps = {
  data: unknown;
  emptyMessage?: string;
  hiddenKeys?: string[];
};

export function RecordDetails({
  data,
  emptyMessage = "Nenhuma informacao adicional retornada.",
  hiddenKeys = [],
}: RecordDetailsProps) {
  const normalizedHiddenKeys = hiddenKeys.map((key) => key.toLowerCase());
  const rows = flattenRecord(data).filter(([key, value]) => {
    const normalizedKey = key.toLowerCase().replace(/[_\s-]/g, "");

    return value.trim() && !normalizedHiddenKeys.some((hiddenKey) => normalizedKey.includes(hiddenKey));
  });

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map(([key, value]) => (
        <article key={key} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="helper-text">{humanizeKey(key)}</p>
          <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-100">{value}</p>
        </article>
      ))}
    </div>
  );
}
