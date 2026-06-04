package com.nmcnpm.scholarslate.repository;

import com.nmcnpm.scholarslate.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Notification findFirstByUserIdAndTopicIdOrderByCreatedAtDesc(Long userId, Long topicId);
    long countByUserIdAndIsRead(Long userId, Integer isRead);
}
