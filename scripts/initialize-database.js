const { db } = require('@vercel/postgres');

async function initializeUsersTable(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    console.log('Created "users" table');

    return {
      createTable
    };
  } catch (error) {
    console.error('Error initializing the user table: ', error);
    throw error;
  }
}

async function initializeAuths(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "auths" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS auths (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        api_key VARCHAR(100) UNIQUE NOT NULL,
        client_id VARCHAR(100) NOT NULL,
        client_secret VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      );
    `;

    console.log('Created "auths" table');

    return {
      createTable
    };
  } catch (error) {
    console.error('Error seeding the auths table: ', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await initializeUsersTable(client);
  await initializeAuths(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to initialize the database tables: ',
    err,
  );
});
