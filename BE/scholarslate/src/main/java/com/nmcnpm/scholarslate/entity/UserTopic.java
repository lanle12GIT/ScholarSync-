package com.nmcnpm.scholarslate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_topic")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTopic {

    @EmbeddedId
    private UserTopicId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("topicId")
    @JoinColumn(name = "topic_id")
    private Topic topic;

    // Các trường phụ trợ (nếu sau này cần thêm)
    // @Column(name = "notification")
    // private Boolean notification;
}
