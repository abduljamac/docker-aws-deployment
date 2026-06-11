import type { ErrorRequestHandler } from "express";
import type { ErrorResponse } from "shared";
import { HttpError } from "../utils/http-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	const status = err instanceof HttpError ? err.status : 500;
	if (status >= 500) {
		console.error(err);
	}
	const body: ErrorResponse = {
		ok: false,
		error: err instanceof Error ? err.message : "Internal server error",
	};
	res.status(status).json(body);
};
