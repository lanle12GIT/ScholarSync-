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
    private final com.nmcnpm.scholarslate.service.AiService aiService;
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

    // Khoảng thời gian không gọi lại AI cho bài đã thử mà thất bại (chống spam call khi bị rate-limit)
    private static final java.time.Duration AI_RETRY_WINDOW = java.time.Duration.ofHours(6);

    private boolean isRecentlyAttempted(java.time.LocalDateTime attemptedAt) {
        return attemptedAt != null
                && attemptedAt.isAfter(java.time.LocalDateTime.now().minus(AI_RETRY_WINDOW));
    }

    @Override
    @Transactional
    public String summarizePaper(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found with id: " + id));

        // Đã có summary hợp lệ -> trả về luôn, không gọi AI
        if (paper.getSummary() != null && !paper.getSummary().trim().isEmpty()) {
            return paper.getSummary();
        }

        // Vừa thử gần đây mà chưa có kết quả -> không gọi lại AI trong vòng AI_RETRY_WINDOW
        if (isRecentlyAttempted(paper.getSummaryAttemptedAt())) {
            return paper.getSummary();
        }

        // Đánh dấu "đã thử" TRƯỚC khi gọi: dù gọi lỗi cũng không retry ngay ở lần sau
        paper.setSummaryAttemptedAt(java.time.LocalDateTime.now());

        String summary = aiService.summarizeText(paper.getAbstractText());
        // Chỉ lưu khi có nội dung thật, KHÔNG lưu chuỗi rỗng "" (tránh vòng lặp tóm tắt lại vô tận)
        if (summary != null && !summary.trim().isEmpty()) {
            paper.setSummary(summary);
        }
        paperRepository.save(paper);
        return paper.getSummary();
    }

    @Override
    @Transactional
    public Float scorePaper(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found with id: " + id));

        if (paper.getPoint() != null) {
            return paper.getPoint();
        }

        if (isRecentlyAttempted(paper.getScoreAttemptedAt())) {
            return paper.getPoint();
        }

        paper.setScoreAttemptedAt(java.time.LocalDateTime.now());

        Float point = aiService.scorePaper(paper.getAbstractText());
        if (point != null) {
            paper.setPoint(point);
        }
        paperRepository.save(paper);
        return paper.getPoint();
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
    public PaperPageResponse getTopRatedPapers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("point").descending().and(Sort.by("publishedAt").descending()));
        Page<Paper> paperPage = paperRepository.findByPointGreaterThanEqual(80.0f, pageable);
        return buildPageResponse(paperPage);
    }
}
