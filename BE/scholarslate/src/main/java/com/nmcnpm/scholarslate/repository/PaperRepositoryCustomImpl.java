package com.nmcnpm.scholarslate.repository;

import com.nmcnpm.scholarslate.entity.Paper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PaperRepositoryCustomImpl implements PaperRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Paper> searchDynamic(String keyword, Long topicId, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        StringBuilder jpql = new StringBuilder("SELECT DISTINCT p FROM Paper p LEFT JOIN p.topics t WHERE 1=1 ");
        StringBuilder countJpql = new StringBuilder("SELECT COUNT(DISTINCT p) FROM Paper p LEFT JOIN p.topics t WHERE 1=1 ");
        
        Map<String, Object> params = new HashMap<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            // Thay thế các ký tự không phải chữ/số (ví dụ khoảng trắng, dấu gạch ngang, v.v.) bằng ký tự đại diện '%'
            // Điều này giúp tìm kiếm linh hoạt hơn, xử lý được các trường hợp có dấu cách kép, ký tự xuống dòng, hoặc non-breaking space trong DB
            String processedKeyword = keyword.trim().replaceAll("[^a-zA-Z0-9]+", "%");
            
            String condition = " AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "OR LOWER(p.summary) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "OR (t.name IS NOT NULL AND LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')))) ";
            jpql.append(condition);
            countJpql.append(condition);
            params.put("keyword", processedKeyword);
        }

        if (topicId != null) {
            String condition = " AND t.id = :topicId ";
            jpql.append(condition);
            countJpql.append(condition);
            params.put("topicId", topicId);
        }

        if (fromDate != null && toDate != null) {
            String condition = " AND p.publishedAt BETWEEN :fromDate AND :toDate ";
            jpql.append(condition);
            countJpql.append(condition);
            params.put("fromDate", fromDate);
            params.put("toDate", toDate);
        }

        // Áp dụng Order By nếu có cấu hình trong Pageable
        if (pageable.getSort().isSorted()) {
            jpql.append(" ORDER BY ");
            pageable.getSort().forEach(order -> {
                jpql.append("p.").append(order.getProperty()).append(" ").append(order.getDirection().name()).append(", ");
            });
            jpql.setLength(jpql.length() - 2); // Xóa dấu phẩy và khoảng trắng cuối
        }

        TypedQuery<Paper> query = entityManager.createQuery(jpql.toString(), Paper.class);
        TypedQuery<Long> countQuery = entityManager.createQuery(countJpql.toString(), Long.class);

        // Gắn parameters vào Query
        params.forEach((k, v) -> {
            query.setParameter(k, v);
            countQuery.setParameter(k, v);
        });

        // Cấu hình phân trang
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<Paper> papers = query.getResultList();
        Long total = countQuery.getSingleResult();

        return new PageImpl<>(papers, pageable, total);
    }
}
