import { PrismaClient } from '@prisma/client';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

type module_user_groups = {
  id: string
  module_user_id: string
  module_group_id: string
  creation_time?: Date | string
  edit_time?: Date | string
}

const insertModuleUserGroupsIntoDatabase = async (prisma: PrismaClient) => {
  const module_groups = await prisma.modules.findMany({
    select: {
      module_groups: {
        select: {
          id: true,
        },
      },
      module_users: {
        select: {
          id: true,
        },
      },
    },
  });

  const data: module_user_groups[] = module_groups.reduce((arr: module_user_groups[], module) => {
    const moduleUserGroups = module.module_users.map((moduleUser) => {
      const randGroup = module.module_groups[Math.floor(Math.random() * module.module_groups.length)];
      return {
        id: uuidv4(),
        module_user_id: moduleUser.id,
        module_group_id: randGroup.id,
      };
    });
    arr.push(...moduleUserGroups);
    return arr;
  }, []);

  await prisma.module_user_groups.createMany({ data });
};

const resetModuleUserGroups = async (prisma: PrismaClient) => {
  const tablename = 'module_user_groups';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertModuleUserGroupsIntoDatabase(prisma);
  console.log(`${tablename} table has been updated`);
};

export { insertModuleUserGroupsIntoDatabase, resetModuleUserGroups };
