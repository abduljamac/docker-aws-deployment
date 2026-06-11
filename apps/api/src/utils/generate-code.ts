import { randomBytes } from "node:crypto";

const ALPHABET =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateCode(length = 7): string {
	const bytes = randomBytes(length);
	let code = "";
	for (const byte of bytes) {
		code += ALPHABET[byte % ALPHABET.length];
	}
	return code;
}
