package com.nmcnpm.scholarslate.repository;

import com.nmcnpm.scholarslate.entity.Topic;
import com.nmcnpm.scholarslate.entity.User;
import com.nmcnpm.scholarslate.entity.UserTopic;
import com.nmcnpm.scholarslate.entity.UserTopicId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserTopicRepository extends JpaRepository<UserTopic, UserTopicId> {
    List<UserTopic> findByUser(User user);
    List<UserTopic> findByTopic(Topic topic);
    void deleteByUserAndTopic(User user, Topic topic);
    boolean existsByUserAndTopic(User user, Topic topic);
    long countByUser(User user);
}
