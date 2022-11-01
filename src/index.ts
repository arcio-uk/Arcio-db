import { PrismaClient } from '@prisma/client';
import * as tb from 'make-table';
// eslint-disable-next-line import/no-named-as-default
import { postTestData } from './util/testDataLoginator';

const prisma = new PrismaClient();

const init = async () => {
  console.time('Time Taken');

  await tb.resetModuleTable(prisma, 200);
  await tb.resetModuleGroups(prisma);
  await tb.resetGroupLessons(prisma);
  await tb.resetRepeatingLessons(prisma);
  await tb.resetActualLessons(prisma);

  await tb.resetRoles(prisma);
  await tb.resetUserTable(prisma, 2000);

  await tb.resetRoleUsers(prisma);
  await tb.resetAttendanceUserRoles(prisma);
  await tb.resetModuleUserTable(prisma, 4);
  await tb.resetModuleUserRoles(prisma);
  await tb.resetModuleUserGroups(prisma);
  await tb.resetModuleGroupUserRoles(prisma);
  await tb.resetAttendanceTable(prisma, 0.7);

  await postTestData(prisma);
  console.timeEnd('Time Taken');
};

init();
