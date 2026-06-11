import { Router } from "express";
import type { ErrorResponse } from "shared";
import { resolveLink } from "../services/links.service.js";

export const redirectRouter = Router();

redirectRouter.get("/:code", async (req, res) => {
	const url = await resolveLink(req.params.code);
	if (url === null) {
		const body: ErrorResponse = { ok: false, error: "Short link not found" };
		res.status(404).json(body);
		return;
	}
	res.redirect(302, url);
});
