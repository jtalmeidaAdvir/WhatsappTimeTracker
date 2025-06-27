
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "mysql", // SQL Server usa dialeto mysql no Drizzle
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
