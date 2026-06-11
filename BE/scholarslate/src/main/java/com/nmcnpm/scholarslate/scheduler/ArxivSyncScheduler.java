package com.nmcnpm.scholarslate.scheduler;

import com.nmcnpm.scholarslate.service.ArxivSyncService;
import com.nmcnpm.scholarslate.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ArxivSyncScheduler {

    private final ArxivSyncService arxivSyncService;
    private final NotificationService notificationService;

    // Chạy vào 09:30 mỗi ngày
    @Scheduled(cron = "0 30 9 * * *")
    public void scheduleArxivSync() {
        log.info("Bat dau chay tu dong (cron 9h30) cho API sync arXiv...");
        arxivSyncService.syncPapers().thenRun(() -> {
            log.info("Sync hoan tat. Bat dau tao thong bao...");
            notificationService.generateDailyNotifications();
            
            log.info("Thong bao hoan tat. Bat dau cham diem va summary miss...");
            arxivSyncService.scoreMissingPapers();
        });
    }
}
