import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");
const url = new URL(connectionString);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.replace(/^\//, "")),
  connectionLimit: 2
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seed ready. Profiles are created on first Discord login.");
}

main().finally(() => db.$disconnect());
