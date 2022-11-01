import { PrismaClient } from '@prisma/client';
import { dateRange, BATCH_SIZE } from 'util/consts';
import { generateRandomDate, shuffleArray } from 'util/misc';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

type module_users = {
  id: string;
  user_id: string;
  module_id: string;
  creation_time?: Date | string;
  edit_time?: Date | string;
};

const insertModuleUsersIntoDatabase = async (prisma: PrismaClient, moduleUserCount: number) => {
  const modules = await prisma.modules.findMany();
  const users = await prisma.users.findMany();
  let data: module_users[] = [];
  for (const user of users) {
    const randModules = shuffleArray(modules).slice(0, moduleUserCount);
    if (new Set(randModules).size !== randModules.length) {
      console.error('Err rand modules contains duplicate modules :(');
      console.log(randModules);
    }
    data.push(...randModules.map((module) => {
      const creationDate = generateRandomDate(dateRange.start, new Date());
      return {
        id: uuidv4(),
        user_id: user.id,
        module_id: module.id,
        creation_time: creationDate,
        edit_time: generateRandomDate(creationDate, new Date()),
      };
    }));

    if (data.length > BATCH_SIZE) {
      await prisma.module_users.createMany({ data });
      data = [];
    }
  }
  await prisma.module_users.createMany({ data });
};

/**
 * Generates module_users (inserts users into modules)
 *
 * @param prisma
 * @param moduleUserCount The amount of modules each user should be in
 */
const resetModuleUserTable = async (prisma: PrismaClient, moduleUserCount: number) => {
  const tablename = 'module_users';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertModuleUsersIntoDatabase(prisma, moduleUserCount);
  console.log(`${tablename} table has been updated`);
};

export { resetModuleUserTable, insertModuleUsersIntoDatabase };
