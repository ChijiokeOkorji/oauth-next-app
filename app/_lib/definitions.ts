// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: Date;
};

export type UserAPICredentials = {
  id: string;
  user_id: string;
  api_key: string;
  client_id: string;
  client_secret: string;
  created_at: Date;
  updated_at: Date;
};
