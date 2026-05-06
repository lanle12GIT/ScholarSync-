package com.nmcnpm.scholarslate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaperDto {
    private Long id;
    private String arxivId;
    private String title;
    private String abstractText;
    private String summary;
    private String authors;
    private String link;
    private LocalDate publishedAt;
    private LocalDateTime fetchedAt;
    private List<TopicDto> topics;
}
