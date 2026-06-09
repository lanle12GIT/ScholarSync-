package com.nmcnpm.scholarslate.service;

import com.nmcnpm.scholarslate.dto.PaperDto;
import com.nmcnpm.scholarslate.dto.response.PaperPageResponse;

import java.time.LocalDate;

public interface PaperService {

    /**
     * Tìm kiếm paper theo từ khóa, lọc theo topic và ngày
     */
    PaperPageResponse searchPapers(String keyword, Long topicId, LocalDate fromDate, LocalDate toDate, int page, int size);

    /**
     * Lấy chi tiết 1 paper
     */
    PaperDto getPaperById(Long id);

    /**
     * Tóm tắt paper bằng AI
     */
    String summarizePaper(Long id);

    /**
     * Chấm điểm paper bằng AI
     */
    Float scorePaper(Long id);

    /**
     * Lấy danh sách paper cho feed cá nhân
     */
    PaperPageResponse getUserFeed(String email, int page, int size);

    /**
     * Lấy danh sách bài báo đáng đọc (điểm cao >= 80)
     */
    PaperPageResponse getTopRatedPapers(int page, int size);
}
