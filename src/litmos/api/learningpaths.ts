import type { LitmosClient } from "../client.js";
import type { LitmosEnrolledUser, LitmosLearningPath } from "../types.js";

export async function getLearningPath(
  client: LitmosClient,
  learningPathId: string
): Promise<LitmosLearningPath> {
  const res = await client.http.get<LitmosLearningPath>(
    `/learningpaths/${learningPathId}`
  );
  return res.data;
}

export async function getLearningPathUsers(
  client: LitmosClient,
  learningPathId: string
): Promise<LitmosEnrolledUser[]> {
  const res = await client.http.get<LitmosEnrolledUser[]>(
    `/learningpaths/${learningPathId}/users`
  );
  return res.data ?? [];
}

export async function assignLearningPathToUser(
  client: LitmosClient,
  userId: string,
  learningPathId: string
): Promise<void> {
  const xml = `<LearningPaths><LearningPath><Id>${learningPathId}</Id></LearningPath></LearningPaths>`;
  await client.http.post(`/users/${userId}/learningpaths`, xml, {
    headers: { "Content-Type": "text/xml" },
  });
}
