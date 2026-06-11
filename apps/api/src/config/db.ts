import pg from "pg";
import { databaseUrl } from "./env.js";

export const pool = new pg.Pool({ connectionString: databaseUrl });
