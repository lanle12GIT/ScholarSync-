package com.nmcnpm.scholarslate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicDto {
    private Long id;
    private String name;
    private Long topicCateg;
    private String key;
    private Long paperCount;
}
