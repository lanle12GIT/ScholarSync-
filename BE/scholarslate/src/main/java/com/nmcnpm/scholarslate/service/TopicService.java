package com.nmcnpm.scholarslate.service;

import com.nmcnpm.scholarslate.dto.TopicDto;

import java.util.List;

public interface TopicService {
    TopicDto createTopicForUser(TopicDto topicDto, String email);
    TopicDto updateTopic(Long topicId, TopicDto topicDto, String email);
    void deleteTopicForUser(Long topicId, String email);
    List<TopicDto> getUserTopics(String email);
}
