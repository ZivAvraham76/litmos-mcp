import { z } from "zod";
import type { LitmosClient } from "../litmos/client.js";
import {
  getModuleSessions,
  registerUserToSession,
  registerUsersToSession,
  createSession,
  rollcallSession,
  markSessionAttendance,
} from "../litmos/api/sessions.js";
import { getUserCourses, assignCourseToUser } from "../litmos/api/users.js";

export const getModuleSessionsSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
  moduleId: z.string().min(1).describe("The ILT module ID within the course"),
};

export async function handleGetModuleSessions(
  client: LitmosClient,
  args: { courseId: string; moduleId: string }
) {
  const sessions = await getModuleSessions(
    client,
    args.courseId,
    args.moduleId
  );
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(sessions, null, 2),
      },
    ],
  };
}

export const registerUserToSessionSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
  moduleId: z.string().min(1).describe("The ILT module ID within the course"),
  sessionId: z.string().min(1).describe("The session ID to register for"),
  userId: z.string().min(1).describe("The Litmos user ID to register"),
};

export async function handleRegisterUserToSession(
  client: LitmosClient,
  args: {
    courseId: string;
    moduleId: string;
    sessionId: string;
    userId: string;
  }
) {
  const existingCourses = await getUserCourses(client, args.userId);
  const hasCourse = existingCourses.some((c) => c.CourseId === args.courseId);

  if (!hasCourse) {
    await assignCourseToUser(client, args.userId, args.courseId);
  }

  await registerUserToSession(
    client,
    args.courseId,
    args.moduleId,
    args.sessionId,
    args.userId
  );

  const action = hasCourse
    ? `Registered to session ${args.sessionId}.`
    : `Course ${args.courseId} was not assigned — assigned it first, then registered to session ${args.sessionId}.`;

  return {
    content: [{ type: "text" as const, text: action }],
  };
}

export const createSessionSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
  moduleId: z.string().min(1).describe("The ILT module ID within the course"),
  name: z.string().min(1).max(100).describe("Session name"),
  instructorUserId: z.string().min(1).max(50).describe("Litmos user ID of the instructor"),
  sessionType: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
    .describe("Session type: 1=Classroom, 2=Virtual, 3=Blended, 4=Other"),
  instructorName: z.string().max(100).optional().describe("Display name of the instructor"),
  location: z.string().max(1000).optional().describe("Location of the session"),
  timeZone: z.string().max(100).optional().describe("Time zone (e.g. 'UTC', 'America/New_York')"),
  startDate: z.string().optional().describe("Session start date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Session end date (YYYY-MM-DD)"),
  slots: z.number().int().min(1).optional().describe("Maximum number of seats"),
  enableWaitList: z.boolean().optional().describe("Allow users to join a wait list when full"),
  days: z
    .array(
      z.object({
        startDate: z.string().describe("Day start date (YYYY-MM-DD)"),
        endDate: z.string().describe("Day end date (YYYY-MM-DD)"),
        startTime: z.string().describe("Day start time (HH:MM)"),
        endTime: z.string().describe("Day end time (HH:MM)"),
        sendReminder: z.boolean().optional().describe("Send reminder for this day"),
        reminderValue: z.string().max(50).optional().describe("Reminder lead time value (e.g. '1')"),
        reminderMetric: z.string().max(100).optional().describe("Reminder unit (e.g. 'days', 'hours')"),
      })
    )
    .optional()
    .describe("List of session days"),
};

export async function handleCreateSession(
  client: LitmosClient,
  args: {
    courseId: string;
    moduleId: string;
    name: string;
    instructorUserId: string;
    sessionType: 1 | 2 | 3 | 4;
    instructorName?: string;
    location?: string;
    timeZone?: string;
    startDate?: string;
    endDate?: string;
    slots?: number;
    enableWaitList?: boolean;
    days?: Array<{
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      sendReminder?: boolean;
      reminderValue?: string;
      reminderMetric?: string;
    }>;
  }
) {
  await createSession(client, args.courseId, args.moduleId, {
    name: args.name,
    instructorUserId: args.instructorUserId,
    sessionType: args.sessionType,
    instructorName: args.instructorName,
    location: args.location,
    timeZone: args.timeZone,
    startDate: args.startDate,
    endDate: args.endDate,
    slots: args.slots,
    enableWaitList: args.enableWaitList,
    days: args.days,
  });
  return {
    content: [
      {
        type: "text" as const,
        text: `Session "${args.name}" created successfully in module ${args.moduleId}.`,
      },
    ],
  };
}

export const bulkRegisterUsersToSessionSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
  moduleId: z.string().min(1).describe("The ILT module ID within the course"),
  sessionId: z.string().min(1).describe("The session ID to register users for"),
  userIds: z
    .array(z.string().min(1))
    .min(1)
    .max(25)
    .describe("List of Litmos user IDs to register (max 25)"),
};

export async function handleBulkRegisterUsersToSession(
  client: LitmosClient,
  args: {
    courseId: string;
    moduleId: string;
    sessionId: string;
    userIds: string[];
  }
) {
  await registerUsersToSession(
    client,
    args.courseId,
    args.moduleId,
    args.sessionId,
    args.userIds
  );
  return {
    content: [
      {
        type: "text" as const,
        text: `${args.userIds.length} user(s) successfully registered to session ${args.sessionId}.`,
      },
    ],
  };
}

export const completeSessionSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
  moduleId: z.string().min(1).describe("The ILT module ID within the course"),
  sessionId: z.string().min(1).describe("The session ID to mark complete"),
  sessionDayId: z.string().min(1).describe("The session day ID to mark attendance for"),
  attended: z.boolean().describe("true = attended, false = did not attend"),
  users: z
    .array(
      z.object({
        userId: z.string().min(1).describe("Litmos user ID"),
        completed: z.boolean().describe("Whether the user completed the session"),
      })
    )
    .min(1)
    .describe("List of users with their completion status. Score is always recorded as 0."),
};

export async function handleCompleteSession(
  client: LitmosClient,
  args: {
    courseId: string;
    moduleId: string;
    sessionId: string;
    sessionDayId: string;
    attended: boolean;
    users: Array<{ userId: string; completed: boolean }>;
  }
) {
  const usersWithScore = args.users.map((u) => ({ ...u, score: 0 }));
  await Promise.all([
    rollcallSession(client, args.courseId, args.moduleId, args.sessionId, usersWithScore),
    markSessionAttendance(client, args.courseId, args.moduleId, args.sessionDayId, args.attended, args.users.map((u) => u.userId)),
  ]);
  return {
    content: [
      {
        type: "text" as const,
        text: `Session ${args.sessionId} marked complete and attendance (${args.attended ? "attended" : "not attended"}) recorded for ${args.users.length} user(s).`,
      },
    ],
  };
}

export const resetSessionScoreSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
  moduleId: z.string().min(1).describe("The ILT module ID within the course"),
  sessionId: z.string().min(1).describe("The session ID to reset scores for"),
  users: z
    .array(
      z.object({
        userId: z.string().min(1).describe("Litmos user ID"),
        completed: z.boolean().describe("Current completed status to preserve — only the score will be reset to 0"),
      })
    )
    .min(1)
    .describe("List of users. Pass each user's current completed status — score will be forced to 0."),
};

export async function handleResetSessionScore(
  client: LitmosClient,
  args: {
    courseId: string;
    moduleId: string;
    sessionId: string;
    users: Array<{ userId: string; completed: boolean }>;
  }
) {
  const users = args.users.map((u) => ({ ...u, score: 0 }));
  await rollcallSession(client, args.courseId, args.moduleId, args.sessionId, users);
  return {
    content: [
      {
        type: "text" as const,
        text: `Score reset to 0 for ${args.users.length} user(s) in session ${args.sessionId}. Completed status preserved.`,
      },
    ],
  };
}
