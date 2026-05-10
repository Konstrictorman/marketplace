import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
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

/**
 * Verifies `plain` against a string produced by {@link hashPassword} (`v1$hexSalt$hexDerived`).
 */
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  if (!stored.startsWith(PREFIX)) {
    return false;
  }
  const rest = stored.slice(PREFIX.length);
  const dollar = rest.indexOf("$");
  if (dollar < 1) {
    return false;
  }
  const saltHex = rest.slice(0, dollar);
  const derivedHex = rest.slice(dollar + 1);
  if (!/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(derivedHex)) {
    return false;
  }
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(derivedHex, "hex");
  } catch {
    return false;
  }
  if (salt.length !== SALT_BYTES || expected.length !== KEYLEN) {
    return false;
  }
  const actual = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
}
