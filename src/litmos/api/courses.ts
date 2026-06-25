import type { LitmosClient } from "../client.js";
import type { LitmosCourse, LitmosModule, LitmosEnrolledUser } from "../types.js";

export async function searchCourses(
  client: LitmosClient,
  query: string,
  limit = 20
): Promise<LitmosCourse[]> {
  const res = await client.http.get<LitmosCourse[]>("/courses", {
    params: { search: query, limit },
  });
  return res.data ?? [];
}

export async function getCourse(
  client: LitmosClient,
  courseId: string
): Promise<LitmosCourse> {
  const res = await client.http.get<LitmosCourse>(`/courses/${courseId}`);
  return res.data;
}

export async function getCourseModules(
  client: LitmosClient,
  courseId: string
): Promise<LitmosModule[]> {
  const res = await client.http.get<LitmosModule[]>(
    `/courses/${courseId}/modules`
  );
  return res.data ?? [];
}

export async function getCourseDetails(
  client: LitmosClient,
  courseId: string
): Promise<unknown> {
  const res = await client.http.get(`/courses/${courseId}/details`);
  return res.data;
}

export async function getCourseUsers(
  client: LitmosClient,
  courseId: string
): Promise<LitmosEnrolledUser[]> {
  const res = await client.http.get<LitmosEnrolledUser[]>(
    `/courses/${courseId}/users`
  );
  return res.data ?? [];
}
