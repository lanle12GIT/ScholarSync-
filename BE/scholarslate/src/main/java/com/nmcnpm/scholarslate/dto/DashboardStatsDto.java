package com.nmcnpm.scholarslate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long topicCount;
    private long newPaperCount;
    private long favoriteCount;
    private long notificationCount;
    private java.util.List<java.util.Map<String, Object>> trendData;
    private java.util.List<String> followedTopicNames;
}
