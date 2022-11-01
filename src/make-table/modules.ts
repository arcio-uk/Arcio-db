import { PrismaClient } from '@prisma/client';
import { BATCH_SIZE, dateRange } from 'util/consts';
import { moduleNames } from 'util/miscData';
import { generateRandomDate } from 'util/misc';
import { DeleteTableContent } from 'util/TableModification';
import { v4 as uuidv4 } from 'uuid';

type module = {
  id: string
  external_id?: string | null
  name: string
  creation_time?: Date | string
  edit_time?: Date | string
  default_overrides?: number
};

const insertModulesIntoDatabase = async (prisma: PrismaClient, moduleCount: number) => {
  let data: module[] = [];
  const courses: { tag: string; name: string; }[] = moduleNames;
  for (let i = 0; i < moduleCount; i++) {
    const course = courses.pop();
    if (!course) break;
    const creationDate = generateRandomDate(dateRange.start, new Date());
    data.push({
      id: uuidv4(),
      external_id: course.tag,
      name: course.name,
      creation_time: creationDate,
      edit_time: generateRandomDate(creationDate, new Date()),
      default_overrides: 0,
    });
    if (data.length > BATCH_SIZE) {
      await prisma.modules.createMany({ data });
      data = [];
    }
  }
  if (data.length > 0) {
    await prisma.modules.createMany({ data });
  }
};

const resetModuleTable = async (prisma: PrismaClient, moduleCount: number) => {
  const tablename = 'modules';
  await DeleteTableContent(prisma, tablename);
  console.log(`${tablename} table has been cleared`);
  await insertModulesIntoDatabase(prisma, moduleCount);
  console.log(`${tablename} table has been updated`);
};

export { insertModulesIntoDatabase, resetModuleTable };
