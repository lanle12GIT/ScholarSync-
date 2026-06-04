package com.nmcnpm.scholarslate.scheduler;

import com.nmcnpm.scholarslate.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationService notificationService;

    // Chạy vào 11:30 mỗi ngày
    @Scheduled(cron = "0 30 11 * * *")
    public void scheduleDailyNotifications() {
        log.info("Bắt đầu chạy tự động lập lịch (cron 11h30) để tạo thông báo hằng ngày...");
        notificationService.generateDailyNotifications();
    }
}
