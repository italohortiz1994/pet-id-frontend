type RawRecord = Record<string, unknown>;

export function nestedRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RawRecord) : undefined;
}

export function unwrapRecord(payload: unknown, keys: string[] = []) {
  const record = nestedRecord(payload);

  if (!record) {
    return {};
  }

  for (const key of keys) {
    const value = nestedRecord(record[key]);

    if (value) {
      return value;
    }
  }

  if (nestedRecord(record.data)) {
    return record.data as RawRecord;
  }

  return record;
}

export function pickFirstString(source: RawRecord, paths: string[]) {
  for (const path of paths) {
    const chunks = path.split(".");
    let current: unknown = source;

    for (const chunk of chunks) {
      const record = nestedRecord(current);

      if (!record) {
        current = undefined;
        break;
      }

      current = record[chunk];
    }

    if (typeof current === "string" && current.trim()) {
      return current;
    }

    if (typeof current === "number" && Number.isFinite(current)) {
      return String(current);
    }
  }

  return "";
}

export function flattenRecord(value: unknown, prefix = ""): Array<[string, string]> {
  if (value === null || value === undefined || typeof value === "function") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenRecord(item, `${prefix}${prefix ? "." : ""}${index + 1}`));
  }

  if (typeof value === "object") {
    return Object.entries(value as RawRecord).flatMap(([key, item]) => {
      const nextPrefix = `${prefix}${prefix ? "." : ""}${key}`;
      return flattenRecord(item, nextPrefix);
    });
  }

  return [[prefix || "valor", String(value)]];
}

export function humanizeKey(key: string) {
  return key
    .replace(/[_-]/g, " ")
    .replace(/\./g, " / ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
