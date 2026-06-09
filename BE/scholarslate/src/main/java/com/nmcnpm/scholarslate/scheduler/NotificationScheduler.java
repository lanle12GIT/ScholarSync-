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

    // Chạy 1 lần/ngày lúc 13:00 (sau khi cả 2 lần sync 08:30 & 10:30 đã hoàn tất)
    @Scheduled(cron = "0 0 13 * * *")
    public void scheduleDailyNotifications() {
        log.info("Bat dau tao thong bao");
        notificationService.generateDailyNotifications();
    }
}
