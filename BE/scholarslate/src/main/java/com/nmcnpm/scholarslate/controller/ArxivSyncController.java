package com.nmcnpm.scholarslate.controller;

import com.nmcnpm.scholarslate.service.ArxivSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/sync")
@RequiredArgsConstructor
public class ArxivSyncController {

    private final ArxivSyncService arxivSyncService;

    @PostMapping("/arxiv")
    public ResponseEntity<String> syncArxivPapers() {
        // Sync chạy bất đồng bộ (@Async) ở background thread
        // API trả về ngay lập tức, kết quả sync xem ở log
        arxivSyncService.syncPapers();
        return ResponseEntity.accepted().body("Arxiv paper synchronization started. Check server logs for progress.");
    }

    @PostMapping("/score-all-missing")
    public ResponseEntity<String> scoreMissingPapers() {
        arxivSyncService.scoreMissingPapers();
        return ResponseEntity.accepted().body("Background job started to score all papers with missing points. Check server logs for progress.");
    }
}
