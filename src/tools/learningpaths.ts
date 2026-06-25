import { z } from "zod";
import type { LitmosClient } from "../litmos/client.js";
import {
  getLearningPath,
  getLearningPathUsers,
  assignLearningPathToUser,
} from "../litmos/api/learningpaths.js";
import { getUserLearningPaths } from "../litmos/api/users.js";



export const getLearningPathSchema = {
  learningPathId: z.string().min(1).describe("The Litmos learning path ID"),
};

export async function handleGetLearningPath(
  client: LitmosClient,
  args: { learningPathId: string }
) {
  const lp = await getLearningPath(client, args.learningPathId);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(lp, null, 2),
      },
    ],
  };
}

export const getLearningPathUsersSchema = {
  learningPathId: z.string().min(1).describe("The Litmos learning path ID"),
};


export async function handleGetLearningPathUsers(
  client: LitmosClient,
  args: { learningPathId: string }
) {
  const users = await getLearningPathUsers(client, args.learningPathId);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(users, null, 2),
      },
    ],
  };
}

export const assignLearningPathToUserSchema = {
  userId: z.string().min(1).describe("The Litmos user ID"),
  learningPathId: z.string().min(1).describe("The Litmos learning path ID to assign"),
};

export async function handleAssignLearningPathToUser(
  client: LitmosClient,
  args: { userId: string; learningPathId: string }
) {
  const existing = await getUserLearningPaths(client, args.userId);
  const alreadyAssigned = existing.some(
    (lp) => lp.LearningPathId === args.learningPathId
  );

  if (alreadyAssigned) {
    const record = existing.find((lp) => lp.LearningPathId === args.learningPathId)!;
    return {
      content: [
        {
          type: "text" as const,
          text: `User ${args.userId} is already assigned to learning path "${record.LearningPathName}". Completed: ${record.Completed ?? false}, Progress: ${record.CompletePercent ?? 0}%.`,
        },
      ],
    };
  }

  await assignLearningPathToUser(client, args.userId, args.learningPathId);
  return {
    content: [
      {
        type: "text" as const,
        text: `Learning path ${args.learningPathId} successfully assigned to user ${args.userId}.`,
      },
    ],
  };
}


