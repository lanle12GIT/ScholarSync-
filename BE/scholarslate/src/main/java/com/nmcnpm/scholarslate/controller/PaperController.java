package com.nmcnpm.scholarslate.controller;

import com.nmcnpm.scholarslate.dto.PaperDto;
import com.nmcnpm.scholarslate.dto.response.PaperPageResponse;
import com.nmcnpm.scholarslate.service.PaperService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/papers")
@RequiredArgsConstructor
public class PaperController {

    private final PaperService paperService;

    /**
     * GET /api/papers/search?keyword=machine+learning&fromDate=2026-05-01&toDate=2026-05-05&page=0&size=10
     *
     * Tìm kiếm paper theo từ khóa (title, abstract, tên topic).
     * Có thể kết hợp lọc theo khoảng ngày.
     */
    @GetMapping("/search")
    public ResponseEntity<PaperPageResponse> searchPapers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(paperService.searchPapers(keyword, topicId, fromDate, toDate, page, size));
    }



    /**
     * GET /api/papers/{id}
     *
     * Lấy chi tiết 1 paper.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaperDto> getPaperById(@PathVariable Long id) {
        return ResponseEntity.ok(paperService.getPaperById(id));
    }
}
