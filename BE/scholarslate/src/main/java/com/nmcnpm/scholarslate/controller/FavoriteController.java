package com.nmcnpm.scholarslate.controller;

import com.nmcnpm.scholarslate.dto.response.PaperPageResponse;
import com.nmcnpm.scholarslate.security.services.UserDetailsImpl;
import com.nmcnpm.scholarslate.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<PaperPageResponse> getFavoritePapers(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(favoriteService.getFavoritePapers(userDetails.getEmail(), page, size));
    }

    @PostMapping("/{paperId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long paperId, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        favoriteService.addFavorite(paperId, userDetails.getEmail());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{paperId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long paperId, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        favoriteService.removeFavorite(paperId, userDetails.getEmail());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{paperId}")
    public ResponseEntity<Boolean> checkFavorite(@PathVariable Long paperId, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isFavorited = favoriteService.checkFavorite(paperId, userDetails.getEmail());
        return ResponseEntity.ok(isFavorited);
    }
}
