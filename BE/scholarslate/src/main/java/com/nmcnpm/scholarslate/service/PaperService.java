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
}
