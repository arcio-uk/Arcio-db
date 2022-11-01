import { PrismaClient } from '@prisma/client';
import { BATCH_SIZE, GROUP_LESSON_SETTINGS } from 'util/consts';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

type group_lessons = {
  id: string
  module_group_id: string
  name: string
  creation_time?: Date | string
  edit_time?: Date | string
  attendance_required: boolean
  description: string
  location: string
  summary: string
};

const insertGroupLessonsIntoDatabase = async (prisma: PrismaClient) => {
  const moduleGroups = await prisma.module_groups.findMany({
    select: {
      id: true,
      modules: {
        select: {
          name: true,
        },
      },
    },
  });

  let data: group_lessons[] = [];
  for (const group of moduleGroups) {
    const lessonsToSet = Math.floor(Math.random() * GROUP_LESSON_SETTINGS.lessonsPerGroup.max) + GROUP_LESSON_SETTINGS.lessonsPerGroup.min;
    for (let i = 0; i < lessonsToSet; i++) {
      data.push({
        id: uuidv4(),
        module_group_id: group.id,
        name: `${group.modules.name} lesson ${i}`,
        attendance_required: Math.random() < GROUP_LESSON_SETTINGS.attendanceRequired,
        description: 'This is a description',
        location: 'This is a location',
        summary: `${group.modules.name} lesson ${i} Summary`,
      });
    }
    if (data.length > BATCH_SIZE) {
      await prisma.group_lessons.createMany({ data });
      data = [];
    }
  }
  if (data.length > 0) {
    await prisma.group_lessons.createMany({ data });
  }
};

const resetGroupLessons = async (prisma: PrismaClient) => {
  const tablename = 'group_lessons';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertGroupLessonsIntoDatabase(prisma);
  console.log(`${tablename} table has been updated`);
};

export { insertGroupLessonsIntoDatabase, resetGroupLessons };
