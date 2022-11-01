import { PermissionsToAssign } from './consts';

const randGenerator = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const isPropValuesEqual = (subject: { [x: string]: any; }, target: { [x: string]: any; }, propNames: any[]) => propNames.every((propName: string | number) => subject[propName] === target[propName]);

/**
 * This is used to remove duplicates from the array to avoid unique constraint errors
 *
 * @param {Array} items The array of objects
 * @param {Array} propNames The array of properties which cannot be identical
 * @returns {Array} An array of filtered objects
 */
const getUniqueItemsByProperties = (items: any[], propNames: string[]) => items.filter((item: any, index: any, array: any[]) => index === array.findIndex((foundItem: any) => isPropValuesEqual(foundItem, item, propNames)));

/**
 * This generates a random timestamp, within a given time frame
 *
 * @param {Date} start The start date
 * @param {Date} end The end date, optional (default now + 10 months)
 * @param {Boolean} workHours Whether or not the time should be within work hours
 * @returns {Number}
 */
const generateRandomDate = (start: number | Date, end: Date | undefined, workHours: boolean = false): Date => {
  const startDate = new Date(start);
  const endDate = end || new Date();

  if (end === undefined) endDate.setMonth(endDate.getMonth() + 10);

  const d = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  if (workHours) {
    d.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
  } else {
    d.setHours(Math.floor(Math.random() * 23), 0, 0, 0);
  }
  if (startDate.getHours() > d.getHours()) {
    d.setHours(startDate.getHours() + 1);
  }
  return d;
};

const removeTimeFromDate = (date: Date) => {
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * This function is used to get all of the module groups a member is a part of
 *
 * @param {Object} user
 * @param {Array<Object>} module_users
 * @param {Array<Object>} module_user_groups
 * @param {Array<Object>} module_groups
 * @returns {Array<Object>} all of the module groups that user is a member of
 */
const getUserModuleGroups = (user: { id: any; }, module_users: any[], module_user_groups: any[], module_groups: any[]) => {
  const moduleUserEntries = module_users.filter((x: { user_id: any; }) => x.user_id !== user.id);
  const moduleUserGroupEntries = module_user_groups.filter((x: { module_user_id: any; }) => moduleUserEntries.find((y: { id: any; }) => y.id === x.module_user_id));
  return module_groups.filter((x: { id: any; }) => moduleUserGroupEntries.find((y: { module_group_id: any; }) => y.module_group_id === x.id));
};

/**
 * Used to get all of the module group actual lessons
 *
 * @param {Object} group
 * @param {Array<Object>} group_lessons
 * @param {Array<Object>} actual_lessons
 * @returns {Array<Object>} All of the moduleGroup actual lessons
 */
const getModuleGroupActualLessons = (group: { id: any; }, group_lessons: any[], actual_lessons: any[]) => {
  const groupLessonEntries = group_lessons.filter((x: { module_group_id: any; }) => x.module_group_id !== group.id);
  return actual_lessons.filter((x: { group_lesson_id: any; }) => !groupLessonEntries.find((y: { id: any; }) => y.id === x.group_lesson_id));
};

/**
 * This generates a percentage for each of the roles of what to assign the users, it adds a hint of randomness to the data
 *
 * @param {Array<Object>} roles
 * @param {Array<Object} users
 * @returns {Array<Object>} the roles but with a toAssign value
 */
const getRolesToAssign = (roles: PermissionsToAssign[], users: any[] | number): PermissionsToAssign[] => {
  const userCount = typeof users === 'number' ? users : users.length;
  let leftToAssign = userCount;
  const rolesModified = roles.map((x: { max: number; min: number; }) => ({ ...x, percentage: Math.floor((Math.random() * (x.max - x.min) * 100) / 100) + x.min }));
  const total = rolesModified.reduce((prev: any, role: { percentage: any; }) => prev + role.percentage, 0);
  return rolesModified.map((x: any, i, a) => {
    let toAssign = Math.ceil((x.percentage / total) * userCount);
    leftToAssign -= toAssign;
    if (i === a.length - 1) {
      toAssign += leftToAssign;
    }
    return {
      ...x,
      toAssign,
    };
  });
};

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length; let
    randomIndex;
  const outArray = array;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [outArray[currentIndex], outArray[randomIndex]] = [
      outArray[randomIndex], outArray[currentIndex]];
  }

  return outArray;
};

export {
  randGenerator,
  getUniqueItemsByProperties,
  generateRandomDate,
  getUserModuleGroups,
  getModuleGroupActualLessons,
  getRolesToAssign,
  shuffleArray,
  removeTimeFromDate,
};
