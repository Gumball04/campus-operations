export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface DashboardRecommendation {
  scheduleId: number;
  courseCode: string;
  courseName: string;
  studentCount: number;
  problem: string;
  currentRoom: string;
  recommendedRoom: string;
  capacity: number;
  score: number;
  reason: string;
}

export interface DashboardSummary {
  totalStudents: number;
  totalRooms: number;
  totalCourses: number;
  totalSchedules: number;
  capacityViolations: number;
  scheduleConflicts: number;
  topRecommendations: DashboardRecommendation[];
}

export interface ScheduleItem {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  studentCount: number;
  roomId: number;
  roomName: string;
  building: string;
  floor: number;
  capacity: number;
  day: string;
  startTime: string;
  endTime: string;
}

export interface RoomItem {
  id: number;
  name: string;
  building: string;
  floor: number;
  capacity: number;
}

export interface CourseItem {
  id: number;
  code: string;
  name: string;
  studentCount: number;
}

export interface StudentItem {
  id: number;
  studentNumber: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
}

export interface CapacityViolation {
  scheduleId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  studentCount: number;
  roomId: number;
  roomName: string;
  capacity: number;
  message: string;
}

export interface ScheduleConflict {
  firstScheduleId: number;
  secondScheduleId: number;
  roomId: number;
  roomName: string;
  day: string;
  firstStartTime: string;
  firstEndTime: string;
  secondStartTime: string;
  secondEndTime: string;
  message: string;
}
