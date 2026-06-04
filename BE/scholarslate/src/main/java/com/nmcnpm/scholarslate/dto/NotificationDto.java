package com.nmcnpm.scholarslate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private Long id;
    private Long userId;
    private Long topicId;
    private String topicName;
    private String message;
    private Integer isRead;
    private LocalDateTime createdAt;
}
