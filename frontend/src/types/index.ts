export type UserRole = 'citizen' | 'admin' | 'moderator' | 'department_head';
export type FeedbackStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  department?: Department;
  isVerified: boolean;
  isActive: boolean;
  authProvider: 'local' | 'google';
  lastLogin?: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  tokenId: string;
  userAgent?: string;
  ip?: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  head?: User;
  email: string;
  phone?: string;
  isActive: boolean;
  icon: string;
  color: string;
  totalFeedback: number;
  resolvedFeedback: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  department: Department;
  icon: string;
  color: string;
  isActive: boolean;
  feedbackCount: number;
  createdAt: string;
}

export interface Attachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface AIAnalysis {
  sentiment: SentimentType;
  sentimentScore: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  keywords: string[];
  topics: string[];
  isSpam: boolean;
  spamScore: number;
  urgencyScore: number;
  isUrgent: boolean;
  language: string;
  summary: string;
  recommendations: string[];
  toxicityScore: number;
  subjectivity: number;
  analyzedAt: string;
}

export interface StatusHistory {
  status: FeedbackStatus;
  changedBy: User;
  changedAt: string;
  note?: string;
}

export interface Feedback {
  _id: string;
  trackingId: string;
  title: string;
  description: string;
  department: Department;
  category: Category;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  rating: number;
  location: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  attachments: Attachment[];
  submittedBy?: User;
  isAnonymous: boolean;
  assignedTo?: User;
  aiAnalysis: AIAnalysis;
  statusHistory: StatusHistory[];
  adminNotes?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  tags: string[];
  viewCount: number;
  upvotes: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  feedback?: { _id: string; trackingId: string; title: string; status: string };
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface Report {
  _id: string;
  name: string;
  type: string;
  format: string;
  status: 'generating' | 'ready' | 'failed';
  generatedBy: string;
  filters: Record<string, unknown>;
  fileUrl?: string;
  fileSize?: number;
  recordCount: number;
  errorMessage?: string;
  expiresAt: string;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface DashboardStats {
  kpi: {
    totalFeedback: number;
    totalUsers: number;
    resolvedFeedback: number;
    pendingFeedback: number;
    urgentFeedback: number;
    avgRating: string;
    resolutionRate: number;
    feedbackGrowth: number;
    currentMonthFeedback: number;
  };
  charts: {
    sentimentDistribution: Array<{ _id: string; count: number }>;
    statusDistribution: Array<{ _id: string; count: number }>;
    priorityDistribution: Array<{ _id: string; count: number }>;
    departmentStats: Array<{
      _id: string;
      name: string;
      code: string;
      color: string;
      total: number;
      resolved: number;
      avgRating: number;
      urgent: number;
      resolutionRate: number;
    }>;
    monthlyTrend: Array<{
      year: number;
      month: number;
      total: number;
      resolved: number;
      positive: number;
      negative: number;
      avgRating: number;
    }>;
    topKeywords: Array<{ word: string; count: number }>;
  };
  recentFeedback: Feedback[];
}
export interface DepartmentAnalyticsDetail {
  department: Department;
  totals: {
    total: number;
    resolved: number;
    pending: number;
    urgent: number;
    avgRating: number;
  };
  charts: {
    statusDistribution: Array<{ _id: string; count: number }>;
    sentimentDistribution: Array<{ _id: string; count: number }>;
    priorityDistribution: Array<{ _id: string; count: number }>;
    monthlyTrend: Array<{ year: number; month: number; total: number; resolved: number }>;
    topKeywords: Array<{ word: string; count: number }>;
  };
  recentFeedback: Feedback[];
}
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface FeedbackFilters {
  page?: number;
  limit?: number;
  status?: FeedbackStatus | '';
  priority?: FeedbackPriority | '';
  department?: string;
  category?: string;
  sentiment?: SentimentType | '';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  isUrgent?: boolean;
}
