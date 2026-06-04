package com.nmcnpm.scholarslate.service;

import com.nmcnpm.scholarslate.dto.NotificationDto;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> getUserNotifications(String email);
    void markAsRead(Long id, String email);
    void generateDailyNotifications();
}
