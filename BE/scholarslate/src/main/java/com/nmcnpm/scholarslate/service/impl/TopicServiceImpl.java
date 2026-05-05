package com.nmcnpm.scholarslate.service.impl;

import com.nmcnpm.scholarslate.dto.TopicDto;
import com.nmcnpm.scholarslate.entity.Topic;
import com.nmcnpm.scholarslate.entity.User;
import com.nmcnpm.scholarslate.entity.UserTopic;
import com.nmcnpm.scholarslate.entity.UserTopicId;
import com.nmcnpm.scholarslate.repository.TopicRepository;
import com.nmcnpm.scholarslate.repository.UserRepository;
import com.nmcnpm.scholarslate.repository.UserTopicRepository;
import com.nmcnpm.scholarslate.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final UserTopicRepository userTopicRepository;

    @Override
    @Transactional
    public TopicDto createTopicForUser(TopicDto topicDto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Find existing topic by id
        Topic topic = topicRepository.findById(topicDto.getId())
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicDto.getId()));

        // Check if already exists
        if (userTopicRepository.existsByUserAndTopic(user, topic)) {
            throw new RuntimeException("Topic đã tồn tại trong danh sách của bạn!");
        }

        // Add to user_topic
        UserTopicId userTopicId = new UserTopicId(user.getId(), topic.getId());
        UserTopic userTopic = UserTopic.builder()
                .id(userTopicId)
                .user(user)
                .topic(topic)
                .build();
        userTopicRepository.save(userTopic);

        return mapToDto(topic);
    }

    @Override
    @Transactional
    public TopicDto updateTopic(Long topicId, TopicDto topicDto, String email) {
        // Tạm thời chưa sửa gì cho Topic, vì Topic là dữ liệu arXiv có sẵn.
        // Chỉ trả về topic hiện tại.
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
        return mapToDto(topic);
    }

    @Override
    @Transactional
    public void deleteTopicForUser(Long topicId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        // Remove from user_topic
        userTopicRepository.deleteByUserAndTopic(user, topic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicDto> getUserTopics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return userTopicRepository.findByUser(user).stream()
                .map(userTopic -> mapToDto(userTopic.getTopic()))
                .collect(Collectors.toList());
    }

    private TopicDto mapToDto(Topic topic) {
        return TopicDto.builder()
                .id(topic.getId())
                .name(topic.getName())
                .topicCateg(topic.getTopicCateg())
                .key(topic.getKey())
                .build();
    }
}
