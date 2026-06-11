import { app } from "./app.js";
import { port } from "./config/env.js";
import { runMigrations } from "./migrations/index.js";

await runMigrations();

app.listen(port, () => {
	console.log(`[api] listening on http://localhost:${port}`);
});
