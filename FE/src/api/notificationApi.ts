import axiosClient from './axiosClient';

export interface NotificationDto {
  id: number;
  userId: number;
  topicId: number;
  topicName: string;
  message: string;
  isRead: number;
  createdAt: string;
}

export const notificationApi = {
  getUserNotifications: (): Promise<NotificationDto[]> => {
    return axiosClient.get('/notifications');
  },
  markAsRead: (id: number): Promise<void> => {
    return axiosClient.put(`/notifications/${id}/read`);
  }
};
