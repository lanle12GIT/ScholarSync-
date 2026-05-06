package com.nmcnpm.scholarslate.service;

import com.nmcnpm.scholarslate.dto.response.PaperPageResponse;

public interface FavoriteService {
    PaperPageResponse getFavoritePapers(String email, int page, int size);
    void addFavorite(Long paperId, String email);
    void removeFavorite(Long paperId, String email);
}
