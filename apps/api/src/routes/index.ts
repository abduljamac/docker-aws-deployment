import { Router } from "express";
import { healthRouter } from "./health.js";
import { linksRouter } from "./links.route.js";
import { redirectRouter } from "./redirect.route.js";

export const router = Router();

router.use("/", healthRouter);
router.use("/", linksRouter);
// Catch-all short-code redirect — must stay last so it never shadows other routes.
router.use("/", redirectRouter);
