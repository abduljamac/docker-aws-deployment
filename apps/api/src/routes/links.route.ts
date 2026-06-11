import { Router } from "express";
import type {
	CreateLinkRequest,
	CreateLinkResponse,
	ListLinksResponse,
} from "shared";
import { createLink, listLinks } from "../services/links.service.js";

export const linksRouter = Router();

linksRouter.post("/api/links", async (req, res) => {
	const { url, code } = (req.body ?? {}) as CreateLinkRequest;
	const link = await createLink(url, code);
	const body: CreateLinkResponse = { ok: true, data: link };
	res.status(201).json(body);
});

linksRouter.get("/api/links", async (_req, res) => {
	const links = await listLinks();
	const body: ListLinksResponse = { ok: true, data: links };
	res.json(body);
});
