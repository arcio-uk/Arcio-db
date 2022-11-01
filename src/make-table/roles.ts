import { PrismaClient } from '@prisma/client';
import { globalPermissions } from 'util/consts';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

export type RolesType = {
  id: string
  name: string
  overrides: number
  creation_time?: Date | string
  edit_time?: Date | string
};

/**
 * Generates global roles based off of the permissions const
 *
 * @returns Roles
 */
const makeGlobalRoles = () => {
  const roles:RolesType[] = [];
  for (const p of globalPermissions) {
    roles.push({
      id: uuidv4(),
      name: p.name,
      overrides: p.overrides,
    });
  }
  return roles;
};

const insertModuleUsersIntoDatabase = async (prisma: PrismaClient) => {
  await prisma.roles.createMany({ data: makeGlobalRoles() });
};

/**
 * Generates roles
 *
 * @param prisma
 * @param moduleUserCount The amount of modules each user should be in
 */
const resetRoles = async (prisma: PrismaClient) => {
  const tablename = 'roles';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertModuleUsersIntoDatabase(prisma);
  console.log(`${tablename} table has been updated`);
};

export { resetRoles, insertModuleUsersIntoDatabase };
