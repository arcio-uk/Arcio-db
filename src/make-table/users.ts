import { sha512 } from 'js-sha512';
import { v4 as uuidv4 } from 'uuid';
import {
  dateRange, BATCH_SIZE,
} from 'util/consts';
import {
  firstNames, surNames, pronounsList,
} from 'util/miscData';
import { randGenerator, generateRandomDate } from 'util/misc';
import { PrismaClient } from '@prisma/client';
import { DeleteTableContent } from 'util/TableModification';

import { faker } from '@faker-js/faker';

interface user {
  id: string;
  external_id?: string | null;
  firstname: string;
  surname: string;
  pronouns?: string | null;
  email: string;
  profile_picture?: string | null;
  password: string;
  salt: string;
  creation_time?: Date | string;
  edit_time?: Date | string;
}

let external_id_count = 1;

const generateExternalID = () => {
  let out = external_id_count.toString();
  for (let i = out.length; i < 3; i++) {
    out = `0${out}`;
  }
  external_id_count++;
  return `100${out}`;
};

const getRandomName = (first: boolean) => {
  if (first) {
    return firstNames[Math.floor(Math.random() * firstNames.length)];
  }
  return surNames[Math.floor(Math.random() * surNames.length)];
};

const makeUserOBJ = () => {
  const firstname = getRandomName(true);
  const surname = getRandomName(false);
  const salt = randGenerator(32);
  const creationDate = generateRandomDate(dateRange.start, new Date());
  const external_id = generateExternalID();
  return {
    id: uuidv4(),
    external_id,
    firstname,
    surname,
    pronouns: pronounsList[Math.floor(Math.random() * pronounsList.length)],
    email: `${firstname}.${external_id}@testing.com`,
    profile_picture: faker.image.avatar(),
    password: sha512(firstname + salt),
    salt,
    creation_time: new Date(creationDate),
    edit_time: new Date(generateRandomDate(creationDate, new Date())),
  };
};

const makeConstantUser = () => {
  const firstname = 'test';
  const surname = 'user';
  const salt = randGenerator(32);
  const creationDate = generateRandomDate(dateRange.start, new Date());
  const external_id = generateExternalID();
  return {
    id: 'bda00a81-1e1b-4f87-baa3-6e0a0989c57a',
    external_id,
    firstname,
    surname,
    email: `${firstname}.${surname}@testing.com`,
    password: sha512(firstname + salt),
    salt,
    pronouns: 'it/its',
    creation_time: creationDate,
    edit_time: generateRandomDate(creationDate, new Date()),
  };
};

const insertUsersIntoDatabase = async (prisma: PrismaClient, userCount: number, haveConstantUser: boolean) => {
  let usersToAdd = userCount;

  if (haveConstantUser) {
    usersToAdd -= 1;
    await prisma.users.create({ data: makeConstantUser() });
  }

  while (usersToAdd > 0) {
    const data: user[] = [];
    const timesToRun = usersToAdd > BATCH_SIZE ? BATCH_SIZE : usersToAdd;
    for (let i = 0; i < timesToRun; i++) {
      data.push(makeUserOBJ());
    }
    await prisma.users.createMany({ data });
    usersToAdd -= BATCH_SIZE;
  }
};

const resetUserTable = async (prisma: PrismaClient, userCount: number) => {
  await DeleteTableContent(prisma, 'users');
  console.log('Users table has been cleared');
  await insertUsersIntoDatabase(prisma, userCount, true);
  console.log('Users table has been updated');
};

export {
  makeConstantUser,
  insertUsersIntoDatabase,
  makeUserOBJ,
  resetUserTable,
  user,
};
