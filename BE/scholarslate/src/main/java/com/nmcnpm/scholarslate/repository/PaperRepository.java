package com.nmcnpm.scholarslate.repository;

import com.nmcnpm.scholarslate.entity.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long>, PaperRepositoryCustom {

    boolean existsByArxivId(String arxivId);
    java.util.List<Paper> findByFetchedAtAfter(java.time.LocalDateTime fetchedAt);
    java.util.List<Paper> findByPointIsNull();
    Page<Paper> findByPointGreaterThanEqual(Float point, Pageable pageable);

    @Query("SELECT p FROM Paper p WHERE EXISTS (SELECT t.id FROM p.topics t WHERE t.id IN :topicIds)")
    Page<Paper> findByUserTopics(@Param("topicIds") java.util.List<Long> topicIds, Pageable pageable);

    @Query("SELECT p FROM Paper p WHERE NOT EXISTS (SELECT t.id FROM p.topics t WHERE t.id IN :topicIds)")
    Page<Paper> findByOtherTopics(@Param("topicIds") java.util.List<Long> topicIds, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Paper p WHERE EXISTS (SELECT t.id FROM p.topics t WHERE t.id IN :topicIds)")
    long countByUserTopics(@Param("topicIds") java.util.List<Long> topicIds);

    @Query("SELECT COUNT(p) FROM Paper p WHERE p.publishedAt = :date AND EXISTS (SELECT t.id FROM p.topics t WHERE t.id IN :topicIds)")
    long countByUserTopicsAndDate(@Param("topicIds") java.util.List<Long> topicIds, @Param("date") LocalDate date);

    @Query("SELECT p.publishedAt, t.name, COUNT(p) " +
           "FROM Paper p JOIN p.topics t " +
           "WHERE t.id IN :topicIds AND p.publishedAt >= :startDate " +
           "GROUP BY p.publishedAt, t.name " +
           "ORDER BY p.publishedAt")
    java.util.List<Object[]> countPapersByTopicsAndDateRange(@Param("topicIds") java.util.List<Long> topicIds, @Param("startDate") LocalDate startDate);

    @Query("SELECT p.publishedAt, COUNT(p) " +
           "FROM Paper p " +
           "WHERE p.publishedAt >= :startDate " +
           "GROUP BY p.publishedAt " +
           "ORDER BY p.publishedAt")
    java.util.List<Object[]> countAllPapersByDateRange(@Param("startDate") LocalDate startDate);
}
