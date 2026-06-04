package com.nmcnpm.scholarslate.scheduler;

import com.nmcnpm.scholarslate.service.ArxivSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ArxivSyncScheduler {

    private final ArxivSyncService arxivSyncService;

    // Chạy vào 08:30 và 10:30 mỗi ngày
    @Scheduled(cron = "0 30 8,10 * * *")
    public void scheduleArxivSync() {
        log.info("Bắt đầu chạy tự động lập lịch (cron 8h30 và 10h30) cho API sync arXiv...");
        arxivSyncService.syncPapers();
    }

    // Chạy vào 09:00 và 11:00 mỗi ngày (sau khi sync xong 30 phút)
    @Scheduled(cron = "0 0 10,12 * * *")
    public void scheduleScoreMissingPapers() {
        log.info("Bắt đầu chạy tự động lập lịch (cron 10h00 và 12h00) để chấm điểm các bài báo còn thiếu điểm...");
        arxivSyncService.scoreMissingPapers();
    }
}
