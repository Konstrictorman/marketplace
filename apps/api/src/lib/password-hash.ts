import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const PREFIX = "v1$";
const SALT_BYTES = 16;
const KEYLEN = 64;

/** Derives a stored password hash (never send to clients). */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  return `${PREFIX}${salt.toString("hex")}$${derived.toString("hex")}`;
}
