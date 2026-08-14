import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

// biome-ignore lint/style/noNonNullAssertion: Variable should be present
export const db = drizzle(process.env.DATABASE_URL!);
