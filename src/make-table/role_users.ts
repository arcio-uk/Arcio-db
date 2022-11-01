import { PrismaClient } from '@prisma/client';
import { globalPermissions } from 'util/consts';
import { getRolesToAssign } from 'util/misc';
import { DeleteTableContent } from 'util/TableModification';

interface role_users {
  user_id: string;
  role_id: string;
}

const insertRoleUsersIntoDatabase = async (prisma: PrismaClient) => {
  const users = await prisma.users.findMany();
  const toAssign = getRolesToAssign(globalPermissions, users);
  toAssign.forEach(async (role) => {
    const globRole = await prisma.roles.findFirst({
      where: {
        name: role.name,
      },
    });

    if (!globRole) throw new Error(`Role ${role.name} not found`);
    if (!role.toAssign) throw new Error(`No users to assign to role ${role.name}`);

    const data: role_users[] = [];
    for (let i = 0; i < role.toAssign; i++) {
      const user = users.pop();
      if (!user) return null;
      data.push({
        role_id: globRole.id,
        user_id: user.id,
      });
    }
    await prisma.role_users.createMany({
      data,
    });
    return null;
  });
};

/**
 * Generates role_users
 *
 * @param prisma
 * @param moduleUserCount The amount of modules each user should be in
 */
const resetRoleUsers = async (prisma: PrismaClient) => {
  const tablename = 'role_users';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertRoleUsersIntoDatabase(prisma);
  console.log(`${tablename} table has been updated`);
};

export { insertRoleUsersIntoDatabase, resetRoleUsers };
