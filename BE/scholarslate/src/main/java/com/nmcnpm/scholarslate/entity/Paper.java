package com.nmcnpm.scholarslate.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paper")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "arxiv_id", unique = true)
    private String arxivId;

    @Column(nullable = false, length = 1000)
    private String title;

    @Column(name = "abstract", columnDefinition = "TEXT")
    private String abstractText;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String authors;

    @Column(length = 500)
    private String link;

    @Column(name = "published_at")
    private LocalDate publishedAt;

    @Column(name = "fetched_at")
    private LocalDateTime fetchedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "paper_topic",
            joinColumns = @JoinColumn(name = "paper_id"),
            inverseJoinColumns = @JoinColumn(name = "topic_id")
    )
    @Builder.Default
    private List<Topic> topics = new ArrayList<>();
}
