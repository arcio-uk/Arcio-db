import { PrismaClient } from '@prisma/client';
import { BATCH_SIZE } from 'util/consts';
import { DeleteTableContent } from 'util/TableModification';

interface ModuleUserRole {
  module_user_id: string;
  role_id: string;
}

const insertModuleUserRolesIntoDatabase = async (prisma: PrismaClient) => {
  const modules = await prisma.modules.findMany({
    select: {
      id: true,
      module_users: {
        select: {
          id: true,
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
  });

  let moduleUserRoles: ModuleUserRole[] = [];

  for (const module of modules) {
    for (const moduleUser of module.module_users) {
      for (const roleUser of moduleUser.users.role_users) {
        moduleUserRoles.push({
          module_user_id: moduleUser.id,
          role_id: roleUser.roles.id,
        });
      }
      // when the length hit's the maximum bath
      if (moduleUserRoles.length > BATCH_SIZE) {
        await prisma.module_user_roles.createMany({ data: moduleUserRoles });
        moduleUserRoles = [];
      }
    }
  }
  await prisma.module_user_roles.createMany({ data: moduleUserRoles });
};

const resetModuleUserRoles = async (prisma: PrismaClient) => {
  const tableName = 'module_user_roles';
  await DeleteTableContent(prisma, tableName);
  console.log(`${tableName} table has been cleared`);
  await insertModuleUserRolesIntoDatabase(prisma);
};

export { resetModuleUserRoles, insertModuleUserRolesIntoDatabase };
