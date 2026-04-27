import { PrismaPg } from "@prisma/adapter-pg";

function getDatabaseConnectionString() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (!databaseUrl) {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);
  url.searchParams.delete("sslmode");

  return url.toString();
}

export function createPrismaAdapter() {
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");

  return new PrismaPg({
    connectionString: getDatabaseConnectionString(),
    ssl: ca
      ? {
          ca,
          rejectUnauthorized: true
        }
      : {
          rejectUnauthorized: false
        }
  });
}
