export interface LitmosCourse {
  Id: string;
  Name: string;
  Code: string;
  Active: boolean;
  Description?: string;
  CourseAccessType?: string;
  DaysToComplete?: number;
  EcommerceEnabled?: boolean;
  OriginalId?: string;
}

export interface LitmosModule {
  Id: string;
  Name: string;
  Type?: string;
  Completed?: boolean;
  UpdatedAt?: string;
}

export interface LitmosILTSession {
  Id: string;
  Name?: string;
  StartDate?: string;
  EndDate?: string;
  Location?: string;
  SeatsLimit?: number;
  SeatsAvailable?: number;
  Instructor?: string;
}

export interface LitmosUser {
  Id: string;
  UserName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Active: boolean;
  Team?: string;
  Manager?: string;
  Department?: string;
  JobTitle?: string;
  CreatedDate?: string;
  LastLoginDate?: string;
}

export interface LitmosUserCourse {
  CourseId: string;
  CourseName: string;
  CompletePercent?: number;
  Completed?: boolean;
  CompletedDate?: string;
  DueDate?: string;
  Overdue?: boolean;
}

export interface LitmosLearningPath {
  Id: string;
  Name: string;
  Description?: string;
  Active?: boolean;
  CourseCount?: number;
  OriginalId?: string;
}

export interface LitmosUserLearningPath {
  LearningPathId: string;
  LearningPathName: string;
  CompletePercent?: number;
  Completed?: boolean;
  CompletedDate?: string;
}

export interface LitmosEnrolledUser {
  Id: string;
  UserName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Active?: boolean;
  CompletePercent?: number;
  Completed?: boolean;
  CompletedDate?: string;
}

export interface BulkImportUser {
  Username: string;
  FirstName: string;
  LastName: string;
  Email?: string;
  Password?: string;
  Phone?: string;
  Mobile?: string;
  Title?: string;
  CompanyName?: string;
  Active?: string;
  AccessLevel?: string;
  Manager?: string;
  Team1?: string;
  Team2?: string;
  Team3?: string;
  Team4?: string;
  Team5?: string;
  Course1?: string;
  Course2?: string;
  Course3?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  State?: string;
  Zip?: string;
  Country?: string;
  JobRole?: string;
  ExternalEmployeeID?: string;
}

export interface BulkImportResult {
  Id: string;
  ImportDate: string;
  Status: string;
  TotalRecords: number;
  TotalUsersCreated: number;
  Failed: number;
  Duplicate: number;
  InvalidEmail: number;
  SendEmails: boolean;
  SkipFirstLogin: boolean;
}

export interface LitmosModuleResultUpdate {
  CourseId: string;
  UserId: string;
  Score: number;
  Completed: 0 | 1;
  UpdatedAt: string;
  Note?: string;
}
