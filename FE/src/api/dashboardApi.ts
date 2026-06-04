import axiosClient from './axiosClient';

export interface DashboardStats {
  topicCount: number;
  newPaperCount: number;
  favoriteCount: number;
  notificationCount: number;
  trendData: any[];
  followedTopicNames: string[];
}

export const dashboardApi = {
  getStats: (year?: number, month?: number) => {
    const params: any = {};
    if (year !== undefined && month !== undefined) {
      params.year = year;
      params.month = month;
    }
    return axiosClient.get('/dashboard/stats', { params });
  }
};
