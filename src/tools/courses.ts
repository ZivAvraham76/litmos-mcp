import { z } from "zod";
import type { LitmosClient } from "../litmos/client.js";
import {
  searchCourses,
  getCourse,
  getCourseDetails,
  getCourseModules,
  getCourseUsers,
} from "../litmos/api/courses.js";

export const searchCoursesSchema = {
  query: z.string().min(1).describe("Search term for course name or keyword"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Maximum number of results (1–100, default 20)"),
};

export async function handleSearchCourses(
  client: LitmosClient,
  args: { query: string; limit?: number }
) {
  const courses = await searchCourses(client, args.query, args.limit ?? 20);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(courses, null, 2),
      },
    ],
  };
}

export const getCourseSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
};

export async function handleGetCourse(
  client: LitmosClient,
  args: { courseId: string }
) {
  const course = await getCourse(client, args.courseId);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(course, null, 2) }],
  };
}

export const getCourseDetailsSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
};

export async function handleGetCourseDetails(
  client: LitmosClient,
  args: { courseId: string }
) {
  const details = await getCourseDetails(client, args.courseId);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(details, null, 2) }],
  };
}

export const getCourseModulesSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
};

export async function handleGetCourseModules(
  client: LitmosClient,
  args: { courseId: string }
) {
  const modules = await getCourseModules(client, args.courseId);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(modules, null, 2),
      },
    ],
  };
}

export const getCourseUsersSchema = {
  courseId: z.string().min(1).describe("The Litmos course ID"),
};

export async function handleGetCourseUsers(
  client: LitmosClient,
  args: { courseId: string }
) {
  const users = await getCourseUsers(client, args.courseId);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(users, null, 2),
      },
    ],
  };
}


