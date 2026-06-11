import request from "supertest";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { pool } from "../config/db.js";

vi.mock("../config/db.js", () => ({
	pool: { query: vi.fn() },
}));

const { app } = await import("../app.js");

const queryMock = pool.query as unknown as Mock;

const linkRow = {
	code: "abc1234",
	url: "https://example.com",
	clicks: 0,
	created_at: new Date("2026-06-11T00:00:00.000Z"),
};

beforeEach(() => {
	queryMock.mockReset();
});

describe("POST /api/links", () => {
	it("creates a short link from a valid URL", async () => {
		queryMock.mockResolvedValueOnce({ rows: [linkRow] });

		const res = await request(app)
			.post("/api/links")
			.send({ url: "https://example.com" });

		expect(res.status).toBe(201);
		expect(res.body).toEqual({
			ok: true,
			data: {
				code: "abc1234",
				url: "https://example.com",
				clicks: 0,
				createdAt: "2026-06-11T00:00:00.000Z",
			},
		});
		const [, params] = queryMock.mock.calls[0];
		expect(params?.[1]).toBe("https://example.com");
	});

	it("uses a custom code when provided", async () => {
		queryMock.mockResolvedValueOnce({
			rows: [{ ...linkRow, code: "my-link" }],
		});

		const res = await request(app)
			.post("/api/links")
			.send({ url: "https://example.com", code: "my-link" });

		expect(res.status).toBe(201);
		expect(res.body.data.code).toBe("my-link");
		const [, params] = queryMock.mock.calls[0];
		expect(params?.[0]).toBe("my-link");
	});

	it("rejects an invalid URL with 400", async () => {
		const res = await request(app)
			.post("/api/links")
			.send({ url: "not a url" });

		expect(res.status).toBe(400);
		expect(res.body.ok).toBe(false);
		expect(queryMock).not.toHaveBeenCalled();
	});

	it("rejects a non-http(s) URL with 400", async () => {
		const res = await request(app)
			.post("/api/links")
			.send({ url: "ftp://example.com" });

		expect(res.status).toBe(400);
		expect(res.body.ok).toBe(false);
	});

	it("rejects an invalid custom code with 400", async () => {
		const res = await request(app)
			.post("/api/links")
			.send({ url: "https://example.com", code: "a!" });

		expect(res.status).toBe(400);
		expect(res.body.ok).toBe(false);
	});

	it("rejects a reserved custom code with 400", async () => {
		const res = await request(app)
			.post("/api/links")
			.send({ url: "https://example.com", code: "api" });

		expect(res.status).toBe(400);
		expect(res.body.ok).toBe(false);
	});

	it("returns 409 when a custom code is already taken", async () => {
		queryMock.mockRejectedValueOnce(
			Object.assign(new Error("duplicate key"), { code: "23505" }),
		);

		const res = await request(app)
			.post("/api/links")
			.send({ url: "https://example.com", code: "taken" });

		expect(res.status).toBe(409);
		expect(res.body.ok).toBe(false);
	});

	it("retries with a new code when a generated code collides", async () => {
		queryMock
			.mockRejectedValueOnce(
				Object.assign(new Error("duplicate key"), { code: "23505" }),
			)
			.mockResolvedValueOnce({ rows: [linkRow] });

		const res = await request(app)
			.post("/api/links")
			.send({ url: "https://example.com" });

		expect(res.status).toBe(201);
		expect(queryMock).toHaveBeenCalledTimes(2);
		const firstCode = queryMock.mock.calls[0][1]?.[0];
		const secondCode = queryMock.mock.calls[1][1]?.[0];
		expect(firstCode).not.toBe(secondCode);
	});
});

describe("GET /api/links", () => {
	it("lists links newest first", async () => {
		queryMock.mockResolvedValueOnce({ rows: [linkRow] });

		const res = await request(app).get("/api/links");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			ok: true,
			data: [
				{
					code: "abc1234",
					url: "https://example.com",
					clicks: 0,
					createdAt: "2026-06-11T00:00:00.000Z",
				},
			],
		});
	});
});

describe("GET /:code", () => {
	it("redirects to the target URL and counts the click", async () => {
		queryMock.mockResolvedValueOnce({ rows: [{ url: "https://example.com" }] });

		const res = await request(app).get("/abc1234");

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe("https://example.com");
		const [sql, params] = queryMock.mock.calls[0];
		expect(String(sql)).toMatch(/clicks\s*\+\s*1/i);
		expect(params).toEqual(["abc1234"]);
	});

	it("returns 404 for an unknown code", async () => {
		queryMock.mockResolvedValueOnce({ rows: [] });

		const res = await request(app).get("/nope123");

		expect(res.status).toBe(404);
		expect(res.body.ok).toBe(false);
	});
});
