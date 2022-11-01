import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

/**
 * Used to get all the tables in the DB
 *
 * @param prisma
 * @returns All the tables in the database
 */
const getAllTables = async (prisma: PrismaClient):
  Promise<{ tables: { table_name: string; }[] | any; }> => prisma.$queryRaw`SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_schema,table_name;`;

/**
 * This deletes all the content from all the tables in the database
 *
 * @param prisma
 * @returns {tables: {table_name: string}[] | any} a promise which is resolved upon completion
 */
const DeleteAllTableContent = (prisma: PrismaClient) => new Promise<void>((resolve) => {
  getAllTables(prisma).then(async (tables: {table_name: string}[] | any) => {
    if (typeof (tables) === 'object') {
      for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE ${table.table_name} CASCADE;`);
      }
    }
    resolve(tables);
  });
});

/**
 * This deletes all the content from a table (cascades)
 *
 * @param prisma
 * @param tableName
 * @returns a promise which is resolved upon completion
 */
const DeleteTableContent = async (prisma: PrismaClient, tableName: string) => {
  const tables = await getAllTables(prisma);
  if (Array.isArray(tables)) {
    let cleared = false;
    for (const table of tables) {
      if (tableName === table.table_name) {
        await prisma.$executeRawUnsafe(`TRUNCATE ${table.table_name} CASCADE;`);
        cleared = true;
        break;
      }
    }
    if (!cleared) {
      throw new Error(`Error, table ${tableName} was not found in the database!`);
    }
  }
  return tables;
};

/**
 * This drops all the tables
 *
 * @param prisma
 * @returns
 */
const DeleteAllTables = async (prisma: PrismaClient) => {
  const tables = await DeleteAllTableContent(prisma);
  if (Array.isArray(tables)) {
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DROP TABLE ${table.table_name} CASCADE;`);
    }
  }
};

const CreateAllTables = async (prisma: PrismaClient, sqlPath: string = './SQL/attendance_tables.sql') => {
  // get the file
  const rawSql = fs.readFileSync(sqlPath, 'utf8');
  // remove comments
  const cleanedSql = rawSql.replace(/\/\*[\s\S]*?\*\/*/g, '');
  // split into queries and put the semicolon back
  const statements = cleanedSql.split(';').map((statement) => `${statement};`);

  // run each query seperatley
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
};

export {
  DeleteAllTableContent,
  DeleteTableContent,
  DeleteAllTables,
  CreateAllTables,
};
