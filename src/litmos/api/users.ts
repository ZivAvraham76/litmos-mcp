import type { LitmosClient } from "../client.js";
import type {
  LitmosUser,
  LitmosUserCourse,
  LitmosUserLearningPath,
  BulkImportUser,
  BulkImportResult,
} from "../types.js";

export async function searchUsers(
  client: LitmosClient,
  query: string,
  limit = 20
): Promise<LitmosUser[]> {
  const res = await client.http.get<LitmosUser[]>("/users", {
    params: { search: query, limit },
  });
  return res.data ?? [];
}

export async function getUser(
  client: LitmosClient,
  userId: string
): Promise<LitmosUser> {
  const res = await client.http.get<LitmosUser>(`/users/${userId}`);
  return res.data;
}

export async function getUserCourses(
  client: LitmosClient,
  userId: string
): Promise<LitmosUserCourse[]> {
  const res = await client.http.get<LitmosUserCourse[]>(
    `/users/${userId}/courses`
  );
  return res.data ?? [];
}

export async function getUserLearningPaths(
  client: LitmosClient,
  userId: string
): Promise<LitmosUserLearningPath[]> {
  const res = await client.http.get<LitmosUserLearningPath[]>(
    `/users/${userId}/learningpaths`
  );
  return res.data ?? [];
}

export async function assignCourseToUser(
  client: LitmosClient,
  userId: string,
  courseId: string
): Promise<void> {
  const xml = `<Courses><Course><Id>${courseId}</Id></Course></Courses>`;
  await client.http.post(`/users/${userId}/courses`, xml, {
    headers: { "Content-Type": "text/xml" },
    params: { sendmessage: false },
  });
}

export async function bulkImportUsers(
  client: LitmosClient,
  users: BulkImportUser[],
  options?: { sendMessage?: boolean; skipFirstLogin?: boolean }
): Promise<BulkImportResult> {
  const res = await client.http.post<BulkImportResult>("/bulkimports", users, {
    params: {
      sendmessage: options?.sendMessage ?? false,
      skipfirstlogin: options?.skipFirstLogin ?? false,
    },
  });
  return res.data;
}

export async function updateUserModuleProgress(
  client: LitmosClient,
  moduleId: string,
  courseId: string,
  userId: string,
  score: number,
  completed: boolean,
  note?: string
): Promise<void> {
  const updatedAt = new Date().toISOString().slice(0, 19);
  const noteXml = note !== undefined ? `<Note>${note}</Note>` : "";
  const xml = `<ModuleResult><CourseId>${courseId}</CourseId><UserId>${userId}</UserId><Score>${score}</Score><Completed>${completed ? 1 : 0}</Completed><UpdatedAt>${updatedAt}</UpdatedAt>${noteXml}</ModuleResult>`;
  await client.http.put(`/results/modules/${moduleId}`, xml, {
    headers: { "Content-Type": "text/xml" },
  });
}
