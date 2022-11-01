import { PrismaClient } from '@prisma/client';
import {
  BATCH_SIZE, endDate, msInDay, startDate,
} from 'util/consts';
import { generateRandomDate, removeTimeFromDate } from 'util/misc';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

const createRepeatingLessonForNow = async (prisma: PrismaClient) => {
  const start_repeating = removeTimeFromDate(new Date());
  const stop_repeating = removeTimeFromDate(new Date(new Date(start_repeating).setDate(start_repeating.getDate() + 3)));
  const start_time = new Date(new Date().getTime() % msInDay);
  const data = {
    id: uuidv4(),
    start_repeating,
    stop_repeating,
    start_time,
    end_time: new Date(start_time.getTime() + (1000 * 60 * 60)),
    repeat_every: new Date(1000 * 60 * 60), // Repeats Every Hour
  };
  const groupLesson = await prisma.group_lessons.findFirst({
    select: {
      id: true,
    },
  });
  if (!groupLesson) throw new Error('No group lesson found');
  await prisma.group_lessons.update({
    data: {
      repeating_lessons: {
        create: data,
      },
    },
    where: {
      id: groupLesson.id,
    },
  });
};

const insertRepeatingLessonsIntoDatabase = async (prisma: PrismaClient) => {
  const groupLessons = await prisma.group_lessons.findMany({
    select: {
      id: true,
    },
  });
  let data = [];
  for (const groupLesson of groupLessons) {
    // between 0 and 2 repeating lessons
    const amount = Math.floor(Math.random() * 3);
    data.push(...[...Array(amount).keys()].map(() => {
      const startTimestamp = generateRandomDate(startDate, new Date(endDate), true);
      const endTimestamp = generateRandomDate(new Date(startTimestamp).setMonth(startTimestamp.getMonth() + 1), new Date(endDate), true);
      return {
        id: uuidv4(),
        group_lesson_id: groupLesson.id,
        start_repeating: removeTimeFromDate(new Date(startTimestamp.getTime())),
        stop_repeating: removeTimeFromDate(new Date(endTimestamp.getTime())),
        start_time: new Date(startTimestamp.getTime() % msInDay),
        end_time: new Date((startTimestamp.getTime() % msInDay) + (1000 * 60 * 60 * 2)),
        repeat_every: new Date(((Math.floor(Math.random() * 3) + 1) * 4) * msInDay),
      };
    }));
    if (data.length > BATCH_SIZE) {
      await prisma.repeating_lessons.createMany({ data });
      data = [];
    }
  }
  if (data.length > 0) {
    await prisma.repeating_lessons.createMany({ data });
  }
};

const resetRepeatingLessons = async (prisma: PrismaClient) => {
  const tablename = 'repeating_lessons';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await createRepeatingLessonForNow(prisma);
  await insertRepeatingLessonsIntoDatabase(prisma);
  console.log(`${tablename} table has been updated`);
};

export { insertRepeatingLessonsIntoDatabase, resetRepeatingLessons };
