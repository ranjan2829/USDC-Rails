import crypto from "crypto";

let cachedPublicKey: string | null = null;

async function getCirclePublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey;

  const res = await fetch("https://api.circle.com/v1/w3s/config/entity/publicKey", {
    headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` },
  });
  const json = await res.json();
  cachedPublicKey = json.data?.publicKey;
  if (!cachedPublicKey) throw new Error("Failed to fetch Circle public key");
  return cachedPublicKey;
}

export async function generateCiphertext(): Promise<string> {
  const publicKey = await getCirclePublicKey();
  const secretBuffer = Buffer.from(process.env.CIRCLE_ENTITY_SECRET!, "hex");
  const encrypted = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    secretBuffer
  );
  return encrypted.toString("base64");
}
