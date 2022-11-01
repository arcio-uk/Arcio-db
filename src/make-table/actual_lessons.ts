import { PrismaClient } from '@prisma/client';
import { BATCH_SIZE } from 'util/consts';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

interface GroupLesson {
  id: string;
  description: string;
  location: string;
  summary: string;
  repeating_lessons: {
      start_repeating: Date;
      stop_repeating: Date;
      start_time: Date;
      end_time: Date;
      repeat_every: Date;
  }[];
}

const getGroupLessons = (prisma: PrismaClient): Promise<GroupLesson[]> => {
  return prisma.group_lessons.findMany({
    select: {
      id: true,
      description: true,
      location: true,
      summary: true,
      repeating_lessons: {
        select: {
          start_repeating: true,
          stop_repeating: true,
          start_time: true,
          end_time: true,
          repeat_every: true,
        },
      },
    },
  });
};

const createActualLessonsFromGroupLesson = (group_lesson: GroupLesson) => {
  return group_lesson.repeating_lessons.reduce((prev: any[], next) => {
    // if it's still in the repeating period, create actual lessons
    // checks the start_repeating and stop_repeating dates along with the start and end times
    if ((next.start_repeating.getTime() + next.start_time.getTime()) < new Date().getTime()
      && (next.stop_repeating.getTime() + next.end_time.getTime()) > new Date().getTime()) {
      let currentTime = next.start_repeating;
      while (currentTime < new Date()) {
        let endTime = next.end_time;
        while (endTime < next.start_time) {
          endTime = new Date(next.end_time.getTime() + (1000 * 60 * 60 * 24));
        }
        prev.push({
          id: uuidv4(),
          group_lesson_id: group_lesson.id,
          start_time: new Date(next.start_time.getTime() + currentTime.getTime()),
          end_time: new Date(endTime.getTime() + currentTime.getTime()),
          description: group_lesson.description,
          location: group_lesson.location,
          summary: group_lesson.summary,
        });
        currentTime = new Date(currentTime.getTime() + next.repeat_every.getTime());
      }
    }
    return prev;
  }, []);
};

const insertActualLessonsIntoDatabase = async (prisma: PrismaClient) => {
  const group_lessons = await getGroupLessons(prisma);
  let data = [];
  for (const group_lesson of group_lessons) {
    const reducedLessons = createActualLessonsFromGroupLesson(group_lesson);
    data.push(...reducedLessons);
    if (data.length > BATCH_SIZE) {
      await prisma.actual_lessons.createMany({ data });
      data = [];
    }
  }
  if (data.length > 0) {
    await prisma.actual_lessons.createMany({ data });
  }
};

const resetActualLessons = async (prisma: PrismaClient) => {
  const tablename = 'actual_lessons';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertActualLessonsIntoDatabase(prisma);
  console.log(`${tablename} table has been updated`);
};

export { insertActualLessonsIntoDatabase, resetActualLessons };
