import { PrismaClient } from '@prisma/client';
import { MODULE_GROUPS_PER_MODULE } from 'util/consts';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

type module_groups = {
  id: string
  module_id: string
  name: string
  creation_time?: Date | string
  edit_time?: Date | string
  default_overrides?: number
};

const insertModuleGroupsIntoDatabase = async (prisma: PrismaClient) => {
  const modules = await prisma.modules.findMany();
  const data: module_groups[] = [];
  modules.forEach((module) => {
    const moduleGroupCount = Math.floor(Math.random() * MODULE_GROUPS_PER_MODULE.max) + MODULE_GROUPS_PER_MODULE.min;
    const moduleGroups: module_groups[] = [...Array(moduleGroupCount).keys()].map((num) => ({
      id: uuidv4(),
      module_id: module.id,
      name: `Group ${num + 1}`,
      default_overrides: 0,
    }));
    data.push(...moduleGroups);
  });
  await prisma.module_groups.createMany({ data });
};

const resetModuleGroups = async (prisma: PrismaClient) => {
  const tablename = 'module_groups';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertModuleGroupsIntoDatabase(prisma);
  console.log(`${tablename} table has been updated`);
};

export { insertModuleGroupsIntoDatabase, resetModuleGroups };
