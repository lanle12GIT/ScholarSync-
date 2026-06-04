package com.nmcnpm.scholarslate.service.impl;

import com.nmcnpm.scholarslate.entity.TopicCategory;
import com.nmcnpm.scholarslate.repository.TopicCategoryRepository;
import com.nmcnpm.scholarslate.service.TopicCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicCategoryServiceImpl implements TopicCategoryService {

    private final TopicCategoryRepository topicCategoryRepository;

    @Override
    public List<TopicCategory> getAllCategories() {
        return topicCategoryRepository.findAll();
    }
}
