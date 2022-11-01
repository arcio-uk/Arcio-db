import { PrismaClient } from '@prisma/client';
import { BATCH_SIZE } from 'util/consts';
import { DeleteTableContent } from 'util/TableModification';

interface ModuleGroupUserRole {
  module_user_groups_id: string;
  role_id: string;
}

const insertModuleUserGroupRolesIntoDatabase = async (prisma: PrismaClient) => {
  const moduleGroups = await prisma.module_groups.findMany({
    select: {
      module_user_groups: {
        select: {
          id: true,
          module_users: {
            select: {
              users: {
                select: {
                  role_users: {
                    select: {
                      roles: {
                        select: {
                          id: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  let moduleGroupUserRoles: ModuleGroupUserRole[] = [];

  for (const moduleGroup of moduleGroups) {
    for (const moduleGroupUser of moduleGroup.module_user_groups) {
      for (const roleUser of moduleGroupUser.module_users.users.role_users) {
        moduleGroupUserRoles.push({
          module_user_groups_id: moduleGroupUser.id,
          role_id: roleUser.roles.id,
        });
      }
      // when the length hit's the maximum bath
      if (moduleGroupUserRoles.length > BATCH_SIZE) {
        await prisma.module_group_user_roles.createMany({ data: moduleGroupUserRoles });
        moduleGroupUserRoles = [];
      }
    }
  }
  await prisma.module_group_user_roles.createMany({ data: moduleGroupUserRoles });
};

const resetModuleGroupUserRoles = async (prisma: PrismaClient) => {
  const tableName = 'module_group_user_roles';
  await DeleteTableContent(prisma, tableName);
  console.log(`${tableName} table has been cleared`);
  await insertModuleUserGroupRolesIntoDatabase(prisma);
  console.log(`${tableName} table has been updated`);
};

export { resetModuleGroupUserRoles, insertModuleUserGroupRolesIntoDatabase };
