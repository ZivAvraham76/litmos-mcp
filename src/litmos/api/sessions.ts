import type { LitmosClient } from "../client.js";
import type { LitmosILTSession } from "../types.js";

export async function getModuleSessions(
  client: LitmosClient,
  courseId: string,
  moduleId: string
): Promise<LitmosILTSession[]> {
  const res = await client.http.get<LitmosILTSession[]>(
    `/courses/${courseId}/modules/${moduleId}/sessions`
  );
  return res.data ?? [];
}

export async function registerUserToSession(
  client: LitmosClient,
  courseId: string,
  moduleId: string,
  sessionId: string,
  userId: string
): Promise<void> {
  await client.http.post(
    `/courses/${courseId}/modules/${moduleId}/sessions/${sessionId}/users/${userId}/register`
  );
}

export interface CreateSessionParams {
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

export async function createSession(
  client: LitmosClient,
  courseId: string,
  moduleId: string,
  params: CreateSessionParams
): Promise<void> {
  const opt = (tag: string, value: string | number | boolean | undefined) =>
    value !== undefined ? `<${tag}>${value}</${tag}>` : "";

  const daysXml =
    params.days && params.days.length > 0
      ? `<Days>${params.days
          .map(
            (d) =>
              `<SessionDay>` +
              `<StartDate>${d.startDate}</StartDate>` +
              `<EndDate>${d.endDate}</EndDate>` +
              `<StartTime>${d.startTime}</StartTime>` +
              `<EndTime>${d.endTime}</EndTime>` +
              opt("SendReminder", d.sendReminder) +
              opt("ReminderValue", d.reminderValue) +
              opt("ReminderMetric", d.reminderMetric) +
              `</SessionDay>`
          )
          .join("")}</Days>`
      : "<Days/>";

  const xml =
    `<Session>` +
    `<Name>${params.name}</Name>` +
    `<InstructorUserId>${params.instructorUserId}</InstructorUserId>` +
    opt("InstructorName", params.instructorName) +
    `<SessionType>${params.sessionType}</SessionType>` +
    daysXml +
    opt("TimeZone", params.timeZone) +
    opt("Location", params.location) +
    opt("StartDate", params.startDate) +
    opt("EndDate", params.endDate) +
    opt("Slots", params.slots) +
    opt("EnableWaitList", params.enableWaitList) +
    `</Session>`;

  await client.http.post(
    `/courses/${courseId}/modules/${moduleId}/sessions`,
    xml,
    { headers: { "Content-Type": "text/xml" } }
  );
}

export async function rollcallSession(
  client: LitmosClient,
  courseId: string,
  moduleId: string,
  sessionId: string,
  users: Array<{ userId: string; score: number; completed: boolean }>
): Promise<void> {
  const usersXml = users
    .map(
      (u) =>
        `<EventUser>` +
        `<Id>${u.userId}</Id>` +
        `<Score>${u.score}</Score>` +
        `<Completed>${u.completed}</Completed>` +
        `</EventUser>`
    )
    .join("");
  const xml = `<EventUsers>${usersXml}</EventUsers>`;
  await client.http.post(
    `/courses/${courseId}/modules/${moduleId}/sessions/${sessionId}/rollcall`,
    xml,
    { headers: { "Content-Type": "text/xml" } }
  );
}

export async function markSessionAttendance(
  client: LitmosClient,
  courseId: string,
  moduleId: string,
  sessionDayId: string,
  attended: boolean,
  userIds: string[]
): Promise<void> {
  const usersXml = userIds.map((id) => `<User><Id>${id}</Id></User>`).join("");
  const xml = `<Users>${usersXml}</Users>`;
  await client.http.post(
    `/courses/${courseId}/modules/${moduleId}/sessiondays/${sessionDayId}/attended/${attended}`,
    xml,
    { headers: { "Content-Type": "text/xml" } }
  );
}

export async function registerUsersToSession(
  client: LitmosClient,
  courseId: string,
  moduleId: string,
  sessionId: string,
  userIds: string[]
): Promise<void> {
  const userXml = userIds.map((id) => `<User><Id>${id}</Id></User>`).join("");
  const xml = `<Users>${userXml}</Users>`;
  await client.http.post(
    `/courses/${courseId}/modules/${moduleId}/sessions/${sessionId}/users/register`,
    xml,
    { headers: { "Content-Type": "text/xml" } }
  );
}
