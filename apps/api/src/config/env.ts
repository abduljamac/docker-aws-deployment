export const port = Number(process.env.PORT ?? 4000);
export const nodeEnv = process.env.NODE_ENV ?? "development";
export const databaseUrl =
	process.env.DATABASE_URL ??
	"postgres://shortlinks:shortlinks@localhost:5432/shortlinks";
