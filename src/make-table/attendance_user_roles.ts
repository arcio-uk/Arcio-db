import { PrismaClient } from '@prisma/client';
import { DeleteTableContent } from 'util/TableModification';
import { attendancePermissions } from 'util/consts';
import { v4 as uuidv4 } from 'uuid';
import { RolesType } from './roles';

const insertAttendanceUserRolesIntoDatabase = async (prisma: PrismaClient) => {
  const attendanceRoles:RolesType[] = [];
  for (const p of attendancePermissions) {
    attendanceRoles.push({
      id: uuidv4(),
      name: `Attendance ${p.name}`,
      overrides: p.overrides,
    });
  }
  await prisma.roles.createMany({
    data: attendanceRoles,
  });

  const usersWithRoles = await prisma.users.findMany({
    select: {
      id: true,
      role_users: {
        select: {
          roles: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  attendanceRoles.forEach(async (attendanceRole) => {
    const users = usersWithRoles.filter((user) => {
      return user.role_users.some((role_user) => {
        return attendanceRole.name.includes(role_user.roles.name);
      });
    });
    const data = users.map((user) => {
      return {
        user_id: user.id,
        role_id: attendanceRole.id,
      };
    });
    await prisma.attendance_user_roles.createMany({ data });
  });
};

const resetAttendanceUserRoles = async (prisma: PrismaClient) => {
  const tablename = 'attendance_user_roles';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertAttendanceUserRolesIntoDatabase(prisma);
  console.log(`${tablename} table has been populated`);
};

export { insertAttendanceUserRolesIntoDatabase, resetAttendanceUserRoles };
