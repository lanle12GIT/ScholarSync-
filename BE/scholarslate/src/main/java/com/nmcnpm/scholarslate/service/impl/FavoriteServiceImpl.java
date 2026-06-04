package com.nmcnpm.scholarslate.service.impl;

import com.nmcnpm.scholarslate.dto.PaperDto;
import com.nmcnpm.scholarslate.dto.response.PaperPageResponse;
import com.nmcnpm.scholarslate.entity.Favorite;
import com.nmcnpm.scholarslate.entity.FavoriteId;
import com.nmcnpm.scholarslate.entity.Paper;
import com.nmcnpm.scholarslate.entity.User;
import com.nmcnpm.scholarslate.mapper.PaperMapper;
import com.nmcnpm.scholarslate.repository.FavoriteRepository;
import com.nmcnpm.scholarslate.repository.PaperRepository;
import com.nmcnpm.scholarslate.repository.UserRepository;
import com.nmcnpm.scholarslate.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final PaperRepository paperRepository;
    private final PaperMapper paperMapper;

    private Pageable createPageable(int page, int size) {
        return PageRequest.of(page, size, Sort.by("createdAt").descending());
    }

    @Override
    public PaperPageResponse getFavoritePapers(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Pageable pageable = createPageable(page, size);
        Page<Favorite> favoritePage = favoriteRepository.findByUser(user, pageable);
        
        List<PaperDto> papers = favoritePage.getContent().stream()
                .map(favorite -> paperMapper.toDto(favorite.getPaper()))
                .collect(Collectors.toList());

        return PaperPageResponse.builder()
                .papers(papers)
                .currentPage(favoritePage.getNumber())
                .totalPages(favoritePage.getTotalPages())
                .totalElements(favoritePage.getTotalElements())
                .pageSize(favoritePage.getSize())
                .hasNext(favoritePage.hasNext())
                .hasPrevious(favoritePage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public void addFavorite(Long paperId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));

        if (favoriteRepository.existsByUserAndPaper(user, paper)) {
            throw new RuntimeException("Paper đã nằm trong danh sách yêu thích!");
        }

        FavoriteId favoriteId = new FavoriteId(user.getId(), paper.getId());
        Favorite favorite = Favorite.builder()
                .id(favoriteId)
                .user(user)
                .paper(paper)
                .build();
        favoriteRepository.save(favorite);
    }

    @Override
    @Transactional
    public void removeFavorite(Long paperId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));

        favoriteRepository.deleteByUserAndPaper(user, paper);
    }

    @Override
    public boolean checkFavorite(Long paperId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));

        return favoriteRepository.existsByUserAndPaper(user, paper);
    }
}
