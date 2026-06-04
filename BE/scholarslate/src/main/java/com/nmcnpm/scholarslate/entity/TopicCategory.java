package com.nmcnpm.scholarslate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "topic_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}
