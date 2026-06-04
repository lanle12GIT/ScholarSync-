package com.nmcnpm.scholarslate.controller;

import com.nmcnpm.scholarslate.entity.TopicCategory;
import com.nmcnpm.scholarslate.service.TopicCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class TopicCategoryController {

    private final TopicCategoryService topicCategoryService;

    @GetMapping
    public ResponseEntity<List<TopicCategory>> getAllCategories() {
        return ResponseEntity.ok(topicCategoryService.getAllCategories());
    }
}
