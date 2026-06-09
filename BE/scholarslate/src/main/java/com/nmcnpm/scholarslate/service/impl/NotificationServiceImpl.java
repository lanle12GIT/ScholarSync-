package com.nmcnpm.scholarslate.service.impl;

import com.nmcnpm.scholarslate.dto.NotificationDto;
import com.nmcnpm.scholarslate.entity.Notification;
import com.nmcnpm.scholarslate.entity.Topic;
import com.nmcnpm.scholarslate.entity.User;
import com.nmcnpm.scholarslate.repository.NotificationRepository;
import com.nmcnpm.scholarslate.repository.TopicRepository;
import com.nmcnpm.scholarslate.repository.UserRepository;
import com.nmcnpm.scholarslate.repository.PaperRepository;
import com.nmcnpm.scholarslate.repository.UserTopicRepository;
import com.nmcnpm.scholarslate.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.nmcnpm.scholarslate.entity.Paper;
import com.nmcnpm.scholarslate.entity.UserTopic;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final PaperRepository paperRepository;
    private final UserTopicRepository userTopicRepository;

    @Override
    public List<NotificationDto> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        return notifications.stream().map(n -> {
            String topicName = topicRepository.findById(n.getTopicId())
                    .map(Topic::getName)
                    .orElse("Unknown Topic");
                    
            return NotificationDto.builder()
                    .id(n.getId())
                    .userId(n.getUserId())
                    .topicId(n.getTopicId())
                    .topicName(topicName)
                    .message(n.getMessage())
                    .isRead(n.getIsRead())
                    .createdAt(n.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
        if (!notification.getUserId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }
        
        notification.setIsRead(1);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void generateDailyNotifications() {
        log.info("=== [CHAY NEN] tao thong bao===");
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<Paper> papersFetchedToday = paperRepository.findByFetchedAtAfter(startOfDay);

        if (papersFetchedToday.isEmpty()) {
            log.info("=== [CHAY NEN] tao thong bao, khong co bai bao nao ca ===");
            return;
        }

        Map<Topic, Long> newPapersPerTopic = new HashMap<>();
        for (Paper paper : papersFetchedToday) {
            for (Topic topic : paper.getTopics()) {
                newPapersPerTopic.put(topic, newPapersPerTopic.getOrDefault(topic, 0L) + 1L);
            }
        }

        for (Map.Entry<Topic, Long> entry : newPapersPerTopic.entrySet()) {
            Topic topic = entry.getKey();
            Long count = entry.getValue();

            List<UserTopic> userTopics = userTopicRepository.findByTopic(topic);
            String message = String.format("Hello, today the ScholarSlate system has successfully compiled %d new scientific articles in the %s category. Please take a few minutes to update yourself on the latest knowledge and research trends!",
                    count, topic.getName());

            for (UserTopic ut : userTopics) {
                Notification existing = notificationRepository.findFirstByUserIdAndTopicIdOrderByCreatedAtDesc(
                        ut.getUser().getId(), topic.getId());

                if (existing != null && existing.getCreatedAt() != null && 
                    existing.getCreatedAt().toLocalDate().equals(LocalDate.now())) {
                    
                    existing.setMessage(message);
                    existing.setIsRead(0); // Đánh dấu chưa đọc lại nếu nội dung được cập nhật
                    notificationRepository.save(existing);
                } else {
                    Notification notification = Notification.builder()
                            .userId(ut.getUser().getId())
                            .topicId(topic.getId())
                            .message(message)
                            .isRead(0)
                            .createdAt(LocalDateTime.now())
                            .build();
                    notificationRepository.save(notification);
                }
            }
        }
    }
}
