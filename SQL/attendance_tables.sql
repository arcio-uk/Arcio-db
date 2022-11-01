/* Users */
create table users(
    /* This is the internal id for arcio */
    id UUID primary key,
    /* This is the external, college id for arcio users */
    external_id varchar(256),
    firstname varchar(256) not null,
    surname varchar(256) not null,
    pronouns varchar(10),
    email varchar(256) not null unique,
    profile_picture varchar(256),
    password varchar(512) not null,
    salt varchar(512) not null,
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp,
    active boolean not null default true
);

create index u_ei on users(external_id);
create index u_e on users(email);
create index u_fn on users(firstname);
create index u_sn on users(surname);

/* Global organisation configuration */
create table global_config (
    id UUID primary key,
    /* Organisation information */
    org_name varchar(256) not null,
    org_icon varchar(256) not null,
    org_banner varchar(256) not null,
    org_support_email varchar(256) not null,
    /* Organisation theme */
    org_primary_colour integer not null,
    org_accent_colour_1 integer not null,
    org_accent_colour_2 integer not null,
    /* Defaults */
    owner_id UUID references users(id) not null,
    /* This is to add a user that cannot have their admin priviledges removed */
    default_overrides integer not null default(0)
);

create unique index global_config_singleton on global_config ((true));

/* Global Roles */
create table roles (
    id UUID primary key,
    name varchar(256) not null,
    overrides integer not null default(0),
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp
);

create table role_users (
    role_id UUID references roles(id) not null,
    user_id UUID references users(id) not null,
    unique(role_id, user_id),
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp
);

create index gru_ri on role_users(role_id);
create index gru_ui on role_users(user_id);

/* Modules */
create table modules (
    id UUID primary key,
    external_id varchar(20),
    name varchar(256) not null,
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp,
    default_overrides integer not null default(0)
);

create index m_ei on modules(external_id);

create table module_users (
    id UUID primary key,
    user_id UUID references users(id) ON DELETE CASCADE not null,
    module_id UUID references modules(id) ON DELETE CASCADE not null,
    unique(module_id, user_id),
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp
);

create index mu_ui on module_users(user_id);
create index mu_mi on module_users(module_id);

create table module_user_roles (
    role_id UUID references roles(id) ON DELETE CASCADE not null,
    module_user_id UUID references module_users(id) ON DELETE CASCADE not null,
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp,
    PRIMARY KEY(role_id, module_user_id)
);

/* Module groups */
create table module_groups (
    id UUID primary key,
    module_id UUID references modules(id) not null,
    unique(id, module_id),
    name varchar(256) not null,
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp,
    default_overrides integer not null default(0)
);

create index mg_mi on module_groups(module_id);

create table module_user_groups (
    id uuid primary key,
    module_user_id UUID references module_users(id) ON DELETE CASCADE not null,
    module_group_id UUID references module_groups(id) ON DELETE CASCADE not null,
    unique(module_user_id, module_group_id),
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp
);

create index mug_mui on module_user_groups(module_user_id);
create index mug_mgi on module_user_groups(module_group_id);

create table module_group_user_roles (
    role_id UUID references roles(id) ON DELETE CASCADE not null,
    module_user_groups_id UUID references module_user_groups(id) ON DELETE CASCADE not null,
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp,
    PRIMARY KEY(role_id, module_user_groups_id)
);

/* Lessons */
/* We need to have summary and description for ICAL compatibility */
create table group_lessons (
    id UUID primary key,
    module_group_id UUID references module_groups(id) ON DELETE CASCADE not null,
    name varchar(256) not null,
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp,
    attendance_required boolean not null,
    description varchar(256) not null,
    location varchar(256) not null,
    summary varchar(256) not null,
    unique (id, module_group_id)
);

create index gl_mgi on group_lessons(module_group_id);

/* Any repeating lesson that occurs will create one of these to put it in the history */
create table actual_lessons (
    id UUID primary key,
    group_lesson_id UUID references group_lessons(id) ON DELETE CASCADE not null,
    start_time timestampTZ not null,
    end_time timestampTZ not null,
    check(start_time < end_time),
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp,
    description varchar(256) not null,
    location varchar(256) not null,
    summary varchar(256) not null
);

create index al_gli on actual_lessons(group_lesson_id);
create index al_st on actual_lessons(start_time);
create index al_et on actual_lessons(end_time);

create table repeating_lessons (
    id uuid primary key,
    group_lesson_id UUID references group_lessons(id) ON DELETE CASCADE not null,
    last_spawned_time timestampTZ,
    start_repeating date not null,
    stop_repeating date not null,
    check(start_repeating < stop_repeating),
    start_time time not null,
    end_time time not null,
    repeat_every timestampTZ not null,
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp
);

create index rl_gli on repeating_lessons(group_lesson_id);
create index rl_srt on repeating_lessons(start_repeating);
create index rl_ert on repeating_lessons(stop_repeating);
create index rl_st on repeating_lessons(start_time);
create index rl_et on repeating_lessons(end_time);

/* Attendance tracking */
create table attendance (
    id UUID primary key,
    lesson_id UUID references actual_lessons(id) ON DELETE CASCADE not null,
    user_id UUID references users(id) ON DELETE CASCADE not null,
    attendance_key char(2) not null DEFAULT '/',
    unique (lesson_id, user_id),
    /* The user-lesson is a composite key*/
    register_time timestampTZ default current_timestamp,
    edit_time timestampTZ not null default current_timestamp
);

create index a_li on attendance(lesson_id);
create index a_ui on attendance(user_id);

create table attendance_user_roles (
    role_id UUID references roles(id) ON DELETE CASCADE not null,
    user_id UUID references users(id) ON DELETE CASCADE not null,
    creation_time timestampTZ not null default current_timestamp,
    edit_time timestampTZ not null default current_timestamp,
    PRIMARY KEY(role_id, user_id)
);

/* Endpoint audit log table */
create table endpoint_audit_logs(
    id UUID primary key,
    user_id UUID references users(id) not null,
    event_time timestampTZ not null default current_timestamp,
    method varchar(7) not null,
    endpoint varchar(256) not null,
    body varchar,
    ip_address cidr
);

create index eau_ui on endpoint_audit_logs(user_id);
create index eau_et on endpoint_audit_logs(event_time);
create index eau_ip on endpoint_audit_logs(ip_address);
