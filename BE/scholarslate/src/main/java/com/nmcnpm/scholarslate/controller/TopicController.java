package com.nmcnpm.scholarslate.controller;

import com.nmcnpm.scholarslate.dto.TopicDto;
import com.nmcnpm.scholarslate.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.nmcnpm.scholarslate.security.services.UserDetailsImpl;

import java.util.List;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @PostMapping
    public ResponseEntity<TopicDto> addTopicForUser(@RequestBody Map<String, String> payload, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String email = userDetails.getEmail();
        String key = payload.get("key");
        if (key == null || key.trim().isEmpty()) {
            throw new RuntimeException("Key is required");
        }
        return new ResponseEntity<>(topicService.createTopicForUser(key, email), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TopicDto>> getUserTopics(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String email = userDetails.getEmail();
        return ResponseEntity.ok(topicService.getUserTopics(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TopicDto> updateTopic(@PathVariable Long id, @RequestBody TopicDto topicDto, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String email = userDetails.getEmail();
        return ResponseEntity.ok(topicService.updateTopic(id, topicDto, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String email = userDetails.getEmail();
        topicService.deleteTopicForUser(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TopicDto>> getTopicsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(topicService.getTopicsByCategory(categoryId));
    }
}
