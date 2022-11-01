import { PrismaClient } from '@prisma/client';
import { BATCH_SIZE } from 'util/consts';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

const insertAttendanceIntoDatabase = async (prisma: PrismaClient, percentage: number) => {
  let count = 0;
  let keepGoing = true;
  while (keepGoing) {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        module_users: {
          select: {
            module_user_groups: {
              select: {
                module_groups: {
                  select: {
                    group_lessons: {
                      select: {
                        actual_lessons: {
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
      orderBy: {
        id: 'asc',
      },
      skip: count,
      take: BATCH_SIZE,
    });
    count += BATCH_SIZE;
    if (users.length < BATCH_SIZE) keepGoing = false;
    let data = [];
    for (const user of users) {
      const actualLessons = user.module_users.reduce((prev: any[], next) => {
        prev.push(...next.module_user_groups);
        return prev;
      }, []).reduce((prev: any[], next) => {
        prev.push(...next.module_groups.group_lessons);
        return prev;
      }, []).reduce((prev: any[], next) => {
        prev.push(...next.actual_lessons);
        return prev;
      }, []);

      data.push(...actualLessons.reduce((prev: any[], lesson) => {
        if (Math.random() < percentage) {
          prev.push({
            id: uuidv4(),
            lesson_id: lesson.id,
            user_id: user.id,
          });
        }
        return prev;
      }, []));
      if (data.length > BATCH_SIZE) {
        await prisma.attendance.createMany({ data });
        data = [];
      }
    }
    if (data.length > 0) {
      await prisma.attendance.createMany({ data });
    }
  }
};

const resetAttendanceTable = async (prisma: PrismaClient, percentage: number) => {
  const tablename = 'attendance';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertAttendanceIntoDatabase(prisma, percentage);
  console.log(`${tablename} table has been updated`);
};

export { insertAttendanceIntoDatabase, resetAttendanceTable };
