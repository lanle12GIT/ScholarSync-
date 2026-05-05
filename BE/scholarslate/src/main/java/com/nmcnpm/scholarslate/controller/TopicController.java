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

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @PostMapping
    public ResponseEntity<TopicDto> addTopicForUser(@RequestBody TopicDto topicDto, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String email = userDetails.getEmail();
        return new ResponseEntity<>(topicService.createTopicForUser(topicDto, email), HttpStatus.CREATED);
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
}
