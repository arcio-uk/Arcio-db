/**
 * All copied from https://github.com/arcio-uk/attendance-system/blob/765131bc9e4fc69f61bb3ca9bb8bdb80ffcb0348/security/default_perms.go
 */

export const PERMS_NONE = 0; // No permissions at all

// CRUD Self (current level)
export const PERMS_CREATE_SELF = 1 << 0;
export const PERMS_READ_SELF = 1 << 1; // read entries in a layer that involve you
export const PERMS_UPDATE_SELF = 1 << 2;
export const PERMS_DELETE_SELF = 1 << 3;

// CRUD Children (lower levels)
// Applies to Global and, Module
export const PERMS_CREATE_CHILDREN = 1 << 4;
export const PERMS_READ_CHILDREN = 1 << 5; // read entries in lower levels that involve you
export const PERMS_UPDATE_CHILDREN = 1 << 6;
export const PERMS_DELETE_CHILDREN = 1 << 7;

// Entries for reading all entries in the layer, you can only update and, delete things that you can see
export const PERMS_READ_ALL_SELF = 1 << 8;
export const PERMS_READ_ALL_CHILDREN = 1 << 9;

// Roles management
export const PERMS_MANAGE_ROLES = 1 << 10;

// Attendance permissions
export const PERMS_ATTENDANCE_ALLOW_PAST_MARK = 1 << 11; // whether a user can change historical records

export const PERMS_VALID_MASK = 0b11111111111; // 11 ones I hope lmao

// This is a bit mask to ignore the self mask of previous layers when calculating permissions
export const PERMS_CHILDREN_MASK = 0xFFFFFFFF ^ PERMS_CREATE_SELF ^ PERMS_READ_SELF ^ PERMS_UPDATE_SELF ^ PERMS_DELETE_SELF ^ PERMS_READ_ALL_SELF;

export const PERMS_CAN_CREATE = PERMS_CREATE_SELF | PERMS_CREATE_CHILDREN;
export const PERMS_CAN_READ_ALL = PERMS_READ_ALL_SELF | PERMS_READ_ALL_CHILDREN;
export const PERMS_CAN_READ = PERMS_READ_SELF | PERMS_READ_CHILDREN | PERMS_CAN_READ_ALL;
export const PERMS_CAN_UPDATE = PERMS_UPDATE_SELF | PERMS_UPDATE_CHILDREN;

export const PERMS_DEFAULT_STUDENT_GLOBAL = PERMS_READ_CHILDREN;
export const PERMS_DEFAULT_STUDENT_MODULE = PERMS_NONE;
export const PERMS_DEFAULT_STUDENT_MODULE_GROUP = PERMS_NONE;
export const PERMS_DEFAULT_STUDENT_ATTENDANCE = PERMS_READ_SELF | PERMS_CREATE_SELF;

// Default permissions - Lecturers
// A teacher can only see their modules and, have complete control of their modules
export const PERMS_DEFAULT_LECTURER_GLOBAL = PERMS_READ_CHILDREN | PERMS_READ_ALL_SELF | PERMS_CREATE_SELF;
export const PERMS_DEFAULT_LECTURER_MODULE = PERMS_READ_CHILDREN | PERMS_READ_ALL_CHILDREN | PERMS_CREATE_CHILDREN | PERMS_UPDATE_CHILDREN | PERMS_DELETE_CHILDREN;
export const PERMS_DEFAULT_LECTURER_MODULE_GROUP = PERMS_NONE;
export const PERMS_DEFAULT_LECTURER_ATTENDANCE = PERMS_NONE;

// Default permissions - Admin Team
// Members of the admin team manage modules and attendance
export const PERMS_DEFAULT_ADMIN = PERMS_READ_CHILDREN | PERMS_READ_ALL_CHILDREN | PERMS_CREATE_CHILDREN | PERMS_UPDATE_CHILDREN | PERMS_DELETE_CHILDREN;
