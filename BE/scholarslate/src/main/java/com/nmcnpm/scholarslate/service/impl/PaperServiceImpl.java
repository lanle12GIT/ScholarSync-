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
    private final com.nmcnpm.scholarslate.service.GeminiService geminiService;
    private final com.nmcnpm.scholarslate.repository.UserRepository userRepository;
    private final com.nmcnpm.scholarslate.repository.UserTopicRepository userTopicRepository;



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

    @Override
    @Transactional
    public String summarizePaper(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found with id: " + id));

        if (paper.getSummary() != null && !paper.getSummary().trim().isEmpty()) {
            return paper.getSummary();
        }

        String summary = geminiService.summarizeText(paper.getAbstractText());
        if (summary != null) {
            paper.setSummary(summary);
            paperRepository.save(paper);
        }
        return summary;
    }

    @Override
    @Transactional
    public Float scorePaper(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found with id: " + id));

        if (paper.getPoint() != null) {
            return paper.getPoint();
        }

        Float point = geminiService.scorePaper(paper.getAbstractText());
        if (point != null) {
            paper.setPoint(point);
            paperRepository.save(paper);
        }
        return point;
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
        List<PaperDto> dtos = paperPage.getContent().stream()
                .map(paperMapper::toDto)
                .collect(Collectors.toList());

        return PaperPageResponse.builder()
                .papers(dtos)
                .currentPage(paperPage.getNumber())
                .totalPages(paperPage.getTotalPages())
                .totalElements(paperPage.getTotalElements())
                .pageSize(paperPage.getSize())
                .hasNext(paperPage.hasNext())
                .hasPrevious(paperPage.hasPrevious())
                .build();
    }

    @Override
    public PaperPageResponse getUserFeed(String email, int page, int size) {
        com.nmcnpm.scholarslate.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<Long> topicIds = userTopicRepository.findByUser(user).stream()
                .map(ut -> ut.getTopic().getId())
                .collect(Collectors.toList());
        
        Pageable pageable = createPageable(page, size);

        if (topicIds == null || topicIds.isEmpty()) {
            return buildPageResponse(Page.empty(pageable));
        }

        return buildPageResponse(paperRepository.findByUserTopics(topicIds, pageable));
    }

    @Override
    public PaperPageResponse getDiscoverFeed(String email, int page, int size) {
        com.nmcnpm.scholarslate.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<Long> topicIds = userTopicRepository.findByUser(user).stream()
                .map(ut -> ut.getTopic().getId())
                .collect(Collectors.toList());
                
        Pageable pageable = createPageable(page, size);

        if (topicIds == null || topicIds.isEmpty()) {
            return buildPageResponse(paperRepository.findAll(pageable));
        }

        return buildPageResponse(paperRepository.findByOtherTopics(topicIds, pageable));
    }

    @Override
    public PaperPageResponse getTopRatedPapers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("point").descending().and(Sort.by("publishedAt").descending()));
        Page<Paper> paperPage = paperRepository.findByPointGreaterThanEqual(80.0f, pageable);
        return buildPageResponse(paperPage);
    }
}
