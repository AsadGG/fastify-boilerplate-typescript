import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { DB } from 'kysely-codegen';
import pg from 'pg';

const { Pool } = pg;

async function createRandomUser() {
  const sex = faker.person.sexType();
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const password = await bcrypt.hash('123', 12);
  return {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    isActive: true,
    phone: faker.phone.number(),
  };
}

export async function seed() {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    }),
  });
  const db = new Kysely<DB>({
    dialect,
    plugins: [new CamelCasePlugin()],
  });

  await db.deleteFrom('user').execute();

  await db
    .insertInto('user')
    .values(
      await Promise.all(
        faker.helpers.multiple(createRandomUser, {
          count: 100,
        })
      )
    )
    .execute();

  await db.destroy();
}
