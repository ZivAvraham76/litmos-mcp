import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "./config.js";
import { LitmosClient } from "./litmos/client.js";
import {
  searchCoursesSchema,
  handleSearchCourses,
  getCourseSchema,
  handleGetCourse,
  getCourseDetailsSchema,
  handleGetCourseDetails,
  getCourseModulesSchema,
  handleGetCourseModules,
  getCourseUsersSchema,
  handleGetCourseUsers,
} from "./tools/courses.js";
import {
  searchUsersSchema,
  handleSearchUsers,
  bulkSearchUsersSchema,
  handleBulkSearchUsers,
  getUserSchema,
  handleGetUser,
  getUserTrainingSchema,
  handleGetUserTraining,
  assignCourseToUserSchema,
  handleAssignCourseToUser,
  bulkAssignCourseToUsersSchema,
  handleBulkAssignCourseToUsers,
  updateModuleProgressSchema,
  handleUpdateModuleProgress,
  bulkUpdateModuleProgressSchema,
  handleBulkUpdateModuleProgress,
  bulkImportUsersSchema,
  handleBulkImportUsers,
} from "./tools/users.js";
import {
  getLearningPathSchema,
  handleGetLearningPath,
  getLearningPathUsersSchema,
  handleGetLearningPathUsers,
  assignLearningPathToUserSchema,
  handleAssignLearningPathToUser,
} from "./tools/learningpaths.js";

import {
  getModuleSessionsSchema,
  handleGetModuleSessions,
  registerUserToSessionSchema,
  handleRegisterUserToSession,
  bulkRegisterUsersToSessionSchema,
  handleBulkRegisterUsersToSession,
  createSessionSchema,
  handleCreateSession,
  completeSessionSchema,
  handleCompleteSession,
  resetSessionScoreSchema,
  handleResetSessionScore,
} from "./tools/sessions.js";

export function createServer(): McpServer {
  const client = new LitmosClient(config.apiKey, config.baseUrl, config.source);
  const server = new McpServer({ name: "litmos-mcp", version: "1.0.0" });

  server.tool(
    "search_courses",
    "Search for Litmos courses by name or keyword. Returns a list of matching courses with their IDs, names, and status.",
    searchCoursesSchema,
    (args) => handleSearchCourses(client, args)
  );

  server.tool(
    "get_course",
    "Get full details for a specific Litmos course by its ID.",
    getCourseSchema,
    (args) => handleGetCourse(client, args)
  );

  server.tool(
    "get_course_details",
    "Get extended details for a specific Litmos course (description, tags, custom fields, etc.) by its ID.",
    getCourseDetailsSchema,
    (args) => handleGetCourseDetails(client, args)
  );

  server.tool(
    "get_course_modules",
    "List all modules inside a specific Litmos course, including module type and completion status.",
    getCourseModulesSchema,
    (args) => handleGetCourseModules(client, args)
  );

  server.tool(
    "get_course_users",
    "Get all users enrolled in a specific Litmos course, including their completion status and progress.",
    getCourseUsersSchema,
    (args) => handleGetCourseUsers(client, args)
  );

  server.tool(
    "get_learning_path",
    "Get details for a specific Litmos learning path by its ID, including name, description, and active status.",
    getLearningPathSchema,
    (args) => handleGetLearningPath(client, args)
  );

  server.tool(
    "get_learning_path_users",
    "Get all users enrolled in a specific Litmos learning path, including their completion status and progress.",
    getLearningPathUsersSchema,
    (args) => handleGetLearningPathUsers(client, args)
  );

  server.tool(
    "assign_learning_path_to_user",
    "Assign a Litmos learning path to a specific user. Checks first if already assigned and returns current progress if so.",
    assignLearningPathToUserSchema,
    (args) => handleAssignLearningPathToUser(client, args)
  );

  server.tool(
    "search_users",
    "Search for Litmos users by name or email address. Returns a list of matching users with their IDs and profile details.",
    searchUsersSchema,
    (args) => handleSearchUsers(client, args)
  );

  server.tool(
    "bulk_search_users",
    "Search for multiple users at once by providing a list of names or emails. Runs all searches in parallel and returns results per query.",
    bulkSearchUsersSchema,
    (args) => handleBulkSearchUsers(client, args)
  );

  server.tool(
    "get_user",
    "Get full profile details for a specific Litmos user by their ID.",
    getUserSchema,
    (args) => handleGetUser(client, args)
  );

  server.tool(
    "get_user_training",
    "Get a user's full training record: all assigned courses and learning paths with completion status and progress percentages.",
    getUserTrainingSchema,
    (args) => handleGetUserTraining(client, args)
  );

  server.tool(
    "assign_course_to_user",
    "Assign a Litmos course to a single user. For multiple users, use bulk_assign_course_to_users instead.",
    assignCourseToUserSchema,
    (args) => handleAssignCourseToUser(client, args)
  );

  server.tool(
    "bulk_assign_course_to_users",
    "Assign a course to a list of users. Use this when registering or enrolling multiple users into a course — do NOT call assign_course_to_user repeatedly. Respects the Litmos rate limit automatically.",
    bulkAssignCourseToUsersSchema,
    (args) => handleBulkAssignCourseToUsers(client, args)
  );

  server.tool(
    "create_session",
    "Create a new ILT session within a course module. Supports single or multi-day sessions with optional location, time zone, seat limit, and wait list.",
    createSessionSchema,
    (args) => handleCreateSession(client, args)
  );

  server.tool(
    "get_module_sessions",
    "List all ILT (Instructor-Led Training) sessions available for a specific module within a course.",
    getModuleSessionsSchema,
    (args) => handleGetModuleSessions(client, args)
  );

  server.tool(
    "register_user_to_session",
    "Register a Litmos user to a specific ILT session within a course module.",
    registerUserToSessionSchema,
    (args) => handleRegisterUserToSession(client, args)
  );

  server.tool(
    "bulk_register_users_to_session",
    "Register up to 25 users to an ILT session in a single API call. Provide a list of user IDs plus the course, module, and session IDs.",
    bulkRegisterUsersToSessionSchema,
    (args) => handleBulkRegisterUsersToSession(client, args)
  );

  server.tool(
    "complete_session",
    "Mark an ILT session complete and record attendance in one call. Runs rollcall and attendance marking in parallel for a list of users.",
    completeSessionSchema,
    (args) => handleCompleteSession(client, args)
  );

  server.tool(
    "reset_session_score",
    "Reset the score to 0 for a list of users in a session, while preserving their current completed status.",
    resetSessionScoreSchema,
    (args) => handleResetSessionScore(client, args)
  );

  server.tool(
    "update_module_progress",
    "Record a module result for a user: set score (0–100), mark as completed or not, and optionally add a note. Uses the Litmos /results/modules API.",
    updateModuleProgressSchema,
    (args) => handleUpdateModuleProgress(client, args)
  );

  server.tool(
    "bulk_update_module_progress",
    "Record the same module result for multiple users in parallel. Provide a list of user IDs plus the score, completed flag, and optional note. Returns a per-user success/failure summary.",
    bulkUpdateModuleProgressSchema,
    (args) => handleBulkUpdateModuleProgress(client, args)
  );

  server.tool(
    "bulk_import_users",
    "Create or update up to ~2000 users in one job, and/or bulk-enroll existing users into courses. Use course1–course3 fields with the CourseCodeForBulkImport to assign courses to many users at once without touching their other profile data. Username is the unique key — existing users are updated, new ones are created. Unspecified fields are left unchanged.",
    bulkImportUsersSchema,
    (args) => handleBulkImportUsers(client, args)
  );

  return server;
}
