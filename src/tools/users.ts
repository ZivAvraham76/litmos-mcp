import { z } from "zod";
import type { LitmosClient } from "../litmos/client.js";
import {
  searchUsers,
  getUser,
  getUserCourses,
  getUserLearningPaths,
  assignCourseToUser,
  updateUserModuleProgress,
  bulkImportUsers,
} from "../litmos/api/users.js";
import { rateLimitedBatch } from "../utils.js";

export const searchUsersSchema = {
  query: z.string().min(1).describe("Search term (name or email)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Maximum number of results (1–100, default 20)"),
};

export async function handleSearchUsers(
  client: LitmosClient,
  args: { query: string; limit?: number }
) {
  const users = await searchUsers(client, args.query, args.limit ?? 20);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(users, null, 2),
      },
    ],
  };
}

export const bulkSearchUsersSchema = {
  queries: z
    .array(z.string().min(1))
    .min(1)
    .describe("List of search terms (names or emails) to look up"),
};

export async function handleBulkSearchUsers(
  client: LitmosClient,
  args: { queries: string[] }
) {
  const settled = await rateLimitedBatch(args.queries, async (query) => {
    const users = await searchUsers(client, query, 5);
    return { query, users };
  });
  const results = settled
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((r): r is { query: string; users: Awaited<ReturnType<typeof searchUsers>> } => r !== null);

  const text = results
    .map(({ query, users }) =>
      users.length === 0
        ? `"${query}": no results`
        : `"${query}": ${JSON.stringify(users, null, 2)}`
    )
    .join("\n\n");

  return {
    content: [{ type: "text" as const, text }],
  };
}

export const getUserSchema = {
  userId: z.string().min(1).describe("The Litmos user ID"),
};

export async function handleGetUser(
  client: LitmosClient,
  args: { userId: string }
) {
  const user = await getUser(client, args.userId);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(user, null, 2),
      },
    ],
  };
}

export const getUserTrainingSchema = {
  userId: z.string().min(1).describe("The Litmos user ID"),
};

export async function handleGetUserTraining(
  client: LitmosClient,
  args: { userId: string }
) {
  const [courses, learningPaths] = await Promise.all([
    getUserCourses(client, args.userId),
    getUserLearningPaths(client, args.userId),
  ]);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ courses, learningPaths }, null, 2),
      },
    ],
  };
}

export const assignCourseToUserSchema = {
  userId: z.string().min(1).describe("The Litmos user ID"),
  courseId: z.string().min(1).describe("The Litmos course ID to assign"),
};

export const bulkAssignCourseToUsersSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID to assign"),
  userIds: z.array(z.string().min(1)).min(1).describe("List of Litmos user IDs to assign the course to"),
};

export async function handleBulkAssignCourseToUsers(
  client: LitmosClient,
  args: { courseId: string; userIds: string[] }
) {
  const results = await rateLimitedBatch(args.userIds, (userId) =>
    assignCourseToUser(client, userId, args.courseId)
  );

  const succeeded: string[] = [];
  const failed: { userId: string; reason: string }[] = [];

  results.forEach((result, i) => {
    const userId = args.userIds[i]!;
    if (result.status === "fulfilled") {
      succeeded.push(userId);
    } else {
      failed.push({ userId, reason: (result.reason as Error).message ?? "Unknown error" });
    }
  });

  const lines: string[] = [`Bulk course assignment complete — ${succeeded.length}/${args.userIds.length} succeeded.`];
  if (succeeded.length > 0) lines.push(`OK: ${succeeded.join(", ")}`);
  if (failed.length > 0) lines.push(`Failed:\n${failed.map((f) => `  ${f.userId}: ${f.reason}`).join("\n")}`);

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}


export async function handleAssignCourseToUser(
  client: LitmosClient,
  args: { userId: string; courseId: string }
) {
  const existing = await getUserCourses(client, args.userId);
  const alreadyAssigned = existing.some((c) => c.CourseId === args.courseId);

  if (alreadyAssigned) {
    const record = existing.find((c) => c.CourseId === args.courseId)!;
    return {
      content: [
        {
          type: "text" as const,
          text: `User ${args.userId} is already assigned to course ${args.courseId} ("${record.CourseName}"). Completed: ${record.Completed ?? false}, Progress: ${record.CompletePercent ?? 0}%.`,
        },
      ],
    };
  }

  await assignCourseToUser(client, args.userId, args.courseId);
  return {
    content: [
      {
        type: "text" as const,
        text: `Course ${args.courseId} successfully assigned to user ${args.userId}.`,
      },
    ],
  };
}

export const updateModuleProgressSchema = {
  userId: z.string().min(1).describe("The Litmos user ID"),
  courseId: z.string().min(1).describe("The Litmos course ID the module belongs to"),
  moduleId: z.string().min(1).describe("The module ID to record results for"),
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Score (0–100). Typically 100 when marking a module complete."),
  completed: z
    .boolean()
    .describe("Set to true to mark the module as completed, false otherwise."),
  note: z
    .string()
    .max(255)
    .optional()
    .describe("Optional note (max 255 characters)"),
};

export async function handleUpdateModuleProgress(
  client: LitmosClient,
  args: {
    userId: string;
    courseId: string;
    moduleId: string;
    score: number;
    completed: boolean;
    note?: string;
  }
) {
  await updateUserModuleProgress(
    client,
    args.moduleId,
    args.courseId,
    args.userId,
    args.score,
    args.completed,
    args.note
  );
  return {
    content: [
      {
        type: "text" as const,
        text: `Module ${args.moduleId} result recorded for user ${args.userId}: score=${args.score}, completed=${args.completed}.`,
      },
    ],
  };
}

export const bulkUpdateModuleProgressSchema = {
  userIds: z
    .array(z.string().min(1))
    .min(1)
    .describe("List of Litmos user IDs to update"),
  courseId: z.string().min(1).describe("The Litmos course ID the module belongs to"),
  moduleId: z.string().min(1).describe("The module ID to record results for"),
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Score (0–100). Typically 100 when marking a module complete."),
  completed: z
    .boolean()
    .describe("Set to true to mark the module as completed, false otherwise."),
  note: z
    .string()
    .max(255)
    .optional()
    .describe("Optional note (max 255 characters)"),
};

export async function handleBulkUpdateModuleProgress(
  client: LitmosClient,
  args: {
    userIds: string[];
    courseId: string;
    moduleId: string;
    score: number;
    completed: boolean;
    note?: string;
  }
) {
  const results = await rateLimitedBatch(args.userIds, (userId) =>
    updateUserModuleProgress(
      client,
      args.moduleId,
      args.courseId,
      userId,
      args.score,
      args.completed,
      args.note
    )
  );

  const succeeded: string[] = [];
  const failed: { userId: string; reason: string }[] = [];

  results.forEach((result, i) => {
    const userId = args.userIds[i]!;
    if (result.status === "fulfilled") {
      succeeded.push(userId);
    } else {
      failed.push({
        userId,
        reason: (result.reason as Error).message ?? "Unknown error",
      });
    }
  });

  const lines: string[] = [
    `Bulk module update complete — ${succeeded.length}/${args.userIds.length} succeeded.`,
  ];
  if (succeeded.length > 0) {
    lines.push(`OK: ${succeeded.join(", ")}`);
  }
  if (failed.length > 0) {
    lines.push(
      `Failed:\n${failed.map((f) => `  ${f.userId}: ${f.reason}`).join("\n")}`
    );
  }

  return {
    content: [{ type: "text" as const, text: lines.join("\n") }],
  };
}

const bulkImportUserSchema = z.object({
  username: z.string().min(1).max(50).describe("Unique username (cannot be changed after creation)"),
  firstName: z.string().min(1).describe("First name"),
  lastName: z.string().min(1).describe("Last name"),
  email: z.string().email().optional().describe("Email address"),
  password: z.string().optional().describe("Password"),
  phone: z.string().optional().describe("Phone number"),
  mobile: z.string().optional().describe("Mobile number"),
  title: z.string().optional().describe("Job title"),
  companyName: z.string().optional().describe("Company name"),
  active: z.boolean().optional().describe("Whether the user is active"),
  accessLevel: z
    .enum(["L", "TL", "TA", "2", "3", "4", "5"])
    .optional()
    .describe("Access level: L=Learner, TL=Team Leader, TA=Team Admin, 2=Account Owner, 3=Administrator"),
  manager: z.string().optional().describe("Manager ID or username"),
  team1: z.string().optional().describe("Team code 1 (use TeamCodeForBulkImport from team settings)"),
  team2: z.string().optional().describe("Team code 2"),
  team3: z.string().optional().describe("Team code 3"),
  team4: z.string().optional().describe("Team code 4"),
  team5: z.string().optional().describe("Team code 5"),
  course1: z.string().optional().describe("Course code 1 (use CourseCodeForBulkImport from course settings)"),
  course2: z.string().optional().describe("Course code 2"),
  course3: z.string().optional().describe("Course code 3"),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  jobRole: z.string().optional().describe("Job role"),
  externalEmployeeId: z.string().optional().describe("External employee ID"),
});

export const bulkImportUsersSchema = {
  users: z
    .array(bulkImportUserSchema)
    .min(1)
    .describe("List of users to create or update. Username is the unique key — existing users are updated, new ones are created."),
  sendMessage: z
    .boolean()
    .optional()
    .default(false)
    .describe("Send login invitation emails to new users (default false)"),
  skipFirstLogin: z
    .boolean()
    .optional()
    .default(false)
    .describe("Skip the first-login setup screen (default false)"),
};

export async function handleBulkImportUsers(
  client: LitmosClient,
  args: {
    users: Array<z.infer<typeof bulkImportUserSchema>>;
    sendMessage?: boolean;
    skipFirstLogin?: boolean;
  }
) {
  const payload = args.users.map((u) => ({
    Username: u.username,
    FirstName: u.firstName,
    LastName: u.lastName,
    ...(u.email !== undefined && { Email: u.email }),
    ...(u.password !== undefined && { Password: u.password }),
    ...(u.phone !== undefined && { Phone: u.phone }),
    ...(u.mobile !== undefined && { Mobile: u.mobile }),
    ...(u.title !== undefined && { Title: u.title }),
    ...(u.companyName !== undefined && { CompanyName: u.companyName }),
    ...(u.active !== undefined && { Active: String(u.active) }),
    ...(u.accessLevel !== undefined && { AccessLevel: u.accessLevel }),
    ...(u.manager !== undefined && { Manager: u.manager }),
    ...(u.team1 !== undefined && { Team1: u.team1 }),
    ...(u.team2 !== undefined && { Team2: u.team2 }),
    ...(u.team3 !== undefined && { Team3: u.team3 }),
    ...(u.team4 !== undefined && { Team4: u.team4 }),
    ...(u.team5 !== undefined && { Team5: u.team5 }),
    ...(u.course1 !== undefined && { Course1: u.course1 }),
    ...(u.course2 !== undefined && { Course2: u.course2 }),
    ...(u.course3 !== undefined && { Course3: u.course3 }),
    ...(u.address1 !== undefined && { Address1: u.address1 }),
    ...(u.address2 !== undefined && { Address2: u.address2 }),
    ...(u.city !== undefined && { City: u.city }),
    ...(u.state !== undefined && { State: u.state }),
    ...(u.zip !== undefined && { Zip: u.zip }),
    ...(u.country !== undefined && { Country: u.country }),
    ...(u.jobRole !== undefined && { JobRole: u.jobRole }),
    ...(u.externalEmployeeId !== undefined && { ExternalEmployeeID: u.externalEmployeeId }),
  }));

  const result = await bulkImportUsers(client, payload, {
    sendMessage: args.sendMessage ?? false,
    skipFirstLogin: args.skipFirstLogin ?? false,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: [
          `Bulk import job created (ID: ${result.Id})`,
          `Status: ${result.Status}`,
          `Total records: ${result.TotalRecords}`,
          `Created: ${result.TotalUsersCreated}`,
          `Failed: ${result.Failed}`,
          `Duplicates: ${result.Duplicate}`,
          `Invalid email: ${result.InvalidEmail}`,
        ].join("\n"),
      },
    ],
  };
}
