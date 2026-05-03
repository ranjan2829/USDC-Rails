import crypto from "crypto";
import https from "https";

const API_KEY = "TEST_API_KEY:64ad329da6e4db4f291278b3ea745a59:12359c2eef00ae48622fcf6ec29faf30";

// Step 1: Generate 32-byte entity secret
const entitySecret = crypto.randomBytes(32).toString("hex");
console.log("\n✅ ENTITY SECRET (save this securely):");
console.log(entitySecret);

// Step 2: Fetch Circle's public key
function fetchPublicKey() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.circle.com",
      path: "/v1/w3s/config/entity/publicKey",
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    https.get(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const json = JSON.parse(data);
        resolve(json.data?.publicKey);
      });
    }).on("error", reject);
  });
}

// Step 3: Encrypt entity secret with Circle's public key
function encryptEntitySecret(publicKeyPem, secret) {
  const secretBuffer = Buffer.from(secret, "hex");
  const encrypted = crypto.publicEncrypt(
    { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    secretBuffer
  );
  return encrypted.toString("base64");
}

const publicKey = await fetchPublicKey();
if (!publicKey) {
  console.error("❌ Failed to fetch public key. Check your API key.");
  process.exit(1);
}

const ciphertext = encryptEntitySecret(publicKey, entitySecret);

console.log("\n✅ ENTITY SECRET CIPHERTEXT (paste into Circle Console):");
console.log(ciphertext);
console.log("\nCiphertext length:", ciphertext.length, "chars");
