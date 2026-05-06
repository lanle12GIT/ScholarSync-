package com.nmcnpm.scholarslate.repository;

import com.nmcnpm.scholarslate.entity.Favorite;
import com.nmcnpm.scholarslate.entity.FavoriteId;
import com.nmcnpm.scholarslate.entity.Paper;
import com.nmcnpm.scholarslate.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    boolean existsByUserAndPaper(User user, Paper paper);
    void deleteByUserAndPaper(User user, Paper paper);
    Page<Favorite> findByUser(User user, Pageable pageable);
}
