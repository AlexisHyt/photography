import "dotenv/config";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";

const { Client } = pg;

function getArgValue(name) {
  const prefixed = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefixed));
  if (inline) {
    return inline.slice(prefixed.length).trim();
  }

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) {
    return String(process.argv[index + 1] ?? "").trim();
  }

  return "";
}

function requireArg(name) {
  const value = getArgValue(name);
  if (!value) {
    throw new Error(`Missing required argument --${name}`);
  }
  return value;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.");
  }

  const email = requireArg("email").toLowerCase();
  const password = requireArg("password");
  const name = requireArg("name");
  const image = getArgValue("image") || null;

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const existing = await client.query(
      'select id from "user" where email = $1 limit 1',
      [email],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      throw new Error(`A user with email ${email} already exists.`);
    }

    const userId = createId();
    const accountRowId = createId();
    const passwordHash = await hashPassword(password);

    await client.query("begin");

    await client.query(
      `insert into "user" (
        id,
        name,
        email,
        email_verified,
        image,
        created_at,
        updated_at
      ) values ($1, $2, $3, $4, $5, now(), now())`,
      [userId, name, email, true, image],
    );

    await client.query(
      `insert into "account" (
        id,
        account_id,
        provider_id,
        user_id,
        password,
        created_at,
        updated_at
      ) values ($1, $2, 'credential', $3, $4, now(), now())`,
      [accountRowId, userId, userId, passwordHash],
    );

    await client.query("commit");

    console.log("Admin user created successfully.");
    console.log(`user_id=${userId}`);
    console.log(`email=${email}`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
