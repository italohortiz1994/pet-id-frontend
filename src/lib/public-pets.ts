import { apiFetch } from "./api";
import { pickFirstString, unwrapRecord } from "./records";

type RawRecord = Record<string, unknown>;

export type PublicPet = {
  id: string;
  petId: string;
  publicId: string;
  name: string;
  breed: string;
  qrCodeUrl: string;
  raw: RawRecord;
};

export function getPublicPetId(raw: RawRecord) {
  return pickFirstString(raw, ["publicId", "public_id", "slug", "qrCode.publicId", "identity.publicId"]);
}

export function getPublicPetQrCode(raw: RawRecord) {
  return pickFirstString(raw, [
    "qrCodeUrl",
    "qr_code_url",
    "qrcode",
    "qrCode",
    "qr.url",
    "identity.qrCodeUrl",
    "identity.qr_code_url",
  ]);
}

function normalizePublicPet(payload: unknown): PublicPet {
  const raw = unwrapRecord(payload, ["pet", "publicPet", "identity"]);

  return {
    id: pickFirstString(raw, ["id", "_id", "petId", "pet.id", "pet._id"]),
    petId: pickFirstString(raw, ["petId", "pet_id", "pet.id", "pet._id"]),
    publicId: getPublicPetId(raw) || pickFirstString(raw, ["id"]),
    name: pickFirstString(raw, ["name", "nome", "pet.name", "pet.nome"]) || "Pet sem nome",
    breed: pickFirstString(raw, ["breed", "raca", "pet.breed", "pet.raca"]),
    qrCodeUrl: getPublicPetQrCode(raw),
    raw,
  };
}

export async function getPublicPet(publicId: string) {
  const payload = await apiFetch<unknown>(`/public/pet/${publicId}`, {
    authenticated: false,
  });

  return normalizePublicPet(payload);
}
