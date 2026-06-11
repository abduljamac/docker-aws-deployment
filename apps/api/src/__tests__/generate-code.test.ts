import { describe, expect, it } from "vitest";
import { generateCode } from "../utils/generate-code.js";

describe("generateCode", () => {
	it("returns a 7-character alphanumeric code by default", () => {
		const code = generateCode();
		expect(code).toMatch(/^[A-Za-z0-9]{7}$/);
	});

	it("respects a custom length", () => {
		expect(generateCode(10)).toHaveLength(10);
	});

	it("produces different codes across calls", () => {
		const codes = new Set(Array.from({ length: 50 }, () => generateCode()));
		expect(codes.size).toBeGreaterThan(1);
	});
});
