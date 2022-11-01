import { PrismaClient } from '@prisma/client';
import { CreateAllTables, DeleteAllTables } from 'util/TableModification';

const prisma = new PrismaClient();

const ResetDatabase = async () => {
  await DeleteAllTables(prisma);
  console.log('All tables deleted');
  await CreateAllTables(prisma);
  console.log('All tables created');
};

ResetDatabase();

export default ResetDatabase;
