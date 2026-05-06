package com.nmcnpm.scholarslate.service.impl;

import com.nmcnpm.scholarslate.dto.PaperDto;
import com.nmcnpm.scholarslate.dto.TopicDto;
import com.nmcnpm.scholarslate.dto.response.PaperPageResponse;
import com.nmcnpm.scholarslate.entity.Paper;
import com.nmcnpm.scholarslate.repository.PaperRepository;
import com.nmcnpm.scholarslate.service.PaperService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaperServiceImpl implements PaperService {

    private final PaperRepository paperRepository;
    private final com.nmcnpm.scholarslate.mapper.PaperMapper paperMapper;



    @Override
    public PaperPageResponse searchPapers(String keyword, Long topicId, LocalDate fromDate, LocalDate toDate, int page, int size) {
        Pageable pageable = createPageable(page, size);
        Page<Paper> paperPage = paperRepository.searchDynamic(keyword, topicId, fromDate, toDate, pageable);
        return buildPageResponse(paperPage);
    }



    @Override
    public PaperDto getPaperById(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found with id: " + id));
        return paperMapper.toDto(paper);
    }

    // ==================== Helper Methods ====================

    /**
     * Tạo Pageable - luôn sắp xếp theo published_a giảm dần (mới nhất trước)
     */
    private Pageable createPageable(int page, int size) {
        return PageRequest.of(page, size, Sort.by("publishedAt").descending());
    }

    /**
     * Build PaperPageResponse từ Page<Paper>
     */
    private PaperPageResponse buildPageResponse(Page<Paper> paperPage) {
        List<PaperDto> papers = paperPage.getContent().stream()
                .map(paperMapper::toDto)
                .collect(Collectors.toList());

        return PaperPageResponse.builder()
                .papers(papers)
                .currentPage(paperPage.getNumber())
                .totalPages(paperPage.getTotalPages())
                .totalElements(paperPage.getTotalElements())
                .pageSize(paperPage.getSize())
                .hasNext(paperPage.hasNext())
                .hasPrevious(paperPage.hasPrevious())
                .build();
    }

}
