import { PrismaClient } from '@prisma/client';
import { Webhook, MessageBuilder } from 'discord-webhook-node';
import os from 'os';

const getUsersWithLessons = async (prisma: PrismaClient) => {
  const repeatingLessons = await prisma.repeating_lessons.findMany({
    where: {
      start_repeating: {
        lte: new Date(),
      },
      stop_repeating: {
        gte: new Date(),
      },
    },
    include: {
      group_lessons: {
        select: {
          module_groups: {
            select: {
              module_user_groups: {
                select: {
                  module_users: {
                    select: {
                      users: {
                        select: {
                          email: true,
                        },
                      },
                    },
                  },
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return repeatingLessons.reduce((prev: any[], lesson) => {
    const actualLessonTimes: any[] = [];
    let last = lesson.start_repeating;
    while (new Date(last.getTime() + lesson.repeat_every.getTime()) < new Date()) {
      last = new Date(last.getTime() + lesson.repeat_every.getTime());
    }
    while (last < lesson.stop_repeating) {
      if (new Date(last.getTime() + lesson.end_time.getTime()) > new Date()) {
        actualLessonTimes.push({
          startActual: new Date(last.getTime() + lesson.start_time.getTime()),
          endActual: new Date(last.getTime() + lesson.end_time.getTime()),
        });
      }
      last = new Date(last.getTime() + lesson.repeat_every.getTime());
    }
    if (actualLessonTimes.length > 0) {
      prev.push({
        ...lesson,
        actualLessonTimes,
      });
    }
    return prev;
  }, [])
  // Map the lesson array to just get the users
    .map((lesson) => {
      return lesson.group_lessons.module_groups.module_user_groups[0].module_users.users;
    })
  // Remove Duplicates
    .filter((value, index, self) => index === self.findIndex((t) => (
      t.email === value.email
    ))).slice(0, 5);
};

const postTestData = async (prisma: PrismaClient) => {
  if (process.env.WEBHOOK_URL) {
    const hook = new Webhook(process.env.WEBHOOK_URL);
    const roles = await prisma.roles.findMany({
      select: {
        role_users: {
          select: {
            users: {
              select: {
                email: true,
              },
            },
          },
          take: 1,
        },
        name: true,
        overrides: true,
        id: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    hook.setUsername('Test Data Loginator');
    let footer = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1].split(':')[0] : 'err';
    if (footer.includes('localhost')) {
      footer = os.hostname();
    }
    const embed = new MessageBuilder()
      .setTitle('Test Logins')
      .setFooter(`Database: ${footer}`)
      .setTimestamp();
    roles.filter((role) => role.role_users.length !== 0).forEach((role) => {
      embed.addField(role.name, `${role.role_users[0].users.email}\nOverrides: ${role.overrides}\nRole ID: ${role.id}`, true);
    });
    await getUsersWithLessons(prisma).then((users) => {
      embed.addField('Users with lessons', users.map((user) => user.email).join('\n'), true);
    });
    await hook.send(embed);
    console.log('Test Data Loginator message has been sent!');
  } else {
    console.log('No webhook url found');
  }
};

export { postTestData, getUsersWithLessons };
