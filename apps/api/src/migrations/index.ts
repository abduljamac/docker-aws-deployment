import { pool } from "../config/db.js";
import { createLinksTable } from "./001-create-links.js";

const migrations = [createLinksTable];

export async function runMigrations(): Promise<void> {
	for (const migration of migrations) {
		await pool.query(migration);
	}
}
