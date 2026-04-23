export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalStaff: number;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  unreadMessages: number;
  cancelledSessions: number;
}

export interface RecentActivity {
  id: string;
  type: 'session' | 'message' | 'student' | 'staff';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}
