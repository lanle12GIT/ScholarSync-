package com.nmcnpm.scholarslate.repository;

import com.nmcnpm.scholarslate.entity.TopicCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicCategoryRepository extends JpaRepository<TopicCategory, Long> {
}
