import {
  PERMS_DEFAULT_ADMIN,
  PERMS_DEFAULT_LECTURER_GLOBAL,
  PERMS_DEFAULT_STUDENT_GLOBAL,
  PERMS_DEFAULT_STUDENT_MODULE,
  PERMS_DEFAULT_LECTURER_MODULE,
  PERMS_DEFAULT_LECTURER_ATTENDANCE,
  PERMS_DEFAULT_STUDENT_ATTENDANCE,
} from 'util/permissionsInts';

const defaultSQL = `
INSERT INTO global_config (
  org_name,
  org_icon,
  org_banner,
  org_support_email,
  org_primary_colour,
  org_accent_colour_1,
  org_accent_colour_2,
  owner_id,
  default_overrides
) VALUES (
  'Example School',
  'http://example.com/fav.ico/',
  'http://example.com/banner.png/',
  'help@example.com',
  123456,
  543210,
  654321,
  'bda00a81-1e1b-4f87-baa3-6e0a0989c57a',
  0
);
`;

const msInWeek = 7 * 24 * 60 * 60 * 1000;
const msInDay = 1000 * 60 * 60 * 24;

interface PermissionsToAssign {
  id?: string;
  name: string;
  overrides: number;
  min: number;
  max: number;
  toAssign?: number;
  AssociatedRole?: {
    name: string;
    overrides: number;
    table: string;
  }
}

/**
 * min, max are percentages (of users) which can be adjusted
 */
const globalPermissions: PermissionsToAssign[] = [
  {
    name: 'Admin',
    overrides: PERMS_DEFAULT_ADMIN,
    min: 1,
    max: 3,
  },
  {
    name: 'Lecturer',
    overrides: PERMS_DEFAULT_LECTURER_GLOBAL,
    min: 5,
    max: 15,
  },
  {
    name: 'Teaching Assistant',
    overrides: PERMS_DEFAULT_LECTURER_MODULE,
    min: 10,
    max: 20,
  },
  {
    name: 'Student',
    overrides: PERMS_DEFAULT_STUDENT_GLOBAL,
    min: 75,
    max: 85,
  },
];

const modulePerms = [
  {
    name: 'Lecturer',
    overrides: PERMS_DEFAULT_LECTURER_MODULE,
    min: 1,
    max: 5,
  },
  {
    name: 'Teaching Assistant',
    overrides: PERMS_DEFAULT_LECTURER_MODULE,
    min: 1,
    max: 5,
  },
  {
    name: 'Student',
    overrides: PERMS_DEFAULT_STUDENT_MODULE,
    min: 75,
    max: 85,
  },
];

const attendancePermissions = [
  {
    name: 'Lecturer',
    overrides: PERMS_DEFAULT_LECTURER_ATTENDANCE,
  },
  {
    name: 'Student',
    overrides: PERMS_DEFAULT_STUDENT_ATTENDANCE,
  },
];

const BATCH_SIZE = 1024;

const MODULE_GROUPS_PER_MODULE = {
  min: 1,
  max: 4,
};

const GROUP_LESSON_SETTINGS = {
  attendanceRequired: 0.7,
  lessonsPerGroup: {
    min: 1,
    max: 3,
  },
};

const startDate = new Date().setMonth(new Date().getDay() - 15);
const endDate = new Date(startDate).setMonth(new Date(startDate).getDay() + 15);

const dateRange = {
  start: startDate,
  end: endDate,
};

export {
  dateRange,
  modulePerms,
  defaultSQL,
  globalPermissions,
  attendancePermissions,
  msInWeek,
  msInDay,
  BATCH_SIZE,
  MODULE_GROUPS_PER_MODULE,
  GROUP_LESSON_SETTINGS,
  PermissionsToAssign,
  startDate,
  endDate,
};
