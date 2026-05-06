package com.nmcnpm.scholarslate.repository;

import com.nmcnpm.scholarslate.entity.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PaperRepositoryCustom {
    Page<Paper> searchDynamic(String keyword, Long topicId, LocalDate fromDate, LocalDate toDate, Pageable pageable);
}
