package com.nmcnpm.scholarslate.service.impl;

import com.nmcnpm.scholarslate.dto.DashboardStatsDto;
import com.nmcnpm.scholarslate.entity.User;
import com.nmcnpm.scholarslate.repository.FavoriteRepository;
import com.nmcnpm.scholarslate.repository.NotificationRepository;
import com.nmcnpm.scholarslate.repository.PaperRepository;
import com.nmcnpm.scholarslate.repository.UserRepository;
import com.nmcnpm.scholarslate.repository.UserTopicRepository;
import com.nmcnpm.scholarslate.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final UserTopicRepository userTopicRepository;
    private final FavoriteRepository favoriteRepository;
    private final PaperRepository paperRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public DashboardStatsDto getDashboardStats(String email) {
        LocalDate now = LocalDate.now();
        return getDashboardStats(email, now.getYear(), now.getMonthValue());
    }

    @Override
    public DashboardStatsDto getDashboardStats(String email, int year, int month) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        long topicCount = userTopicRepository.countByUser(user);
        long favoriteCount = favoriteRepository.countByUser(user);
        long notificationCount = notificationRepository.countByUserIdAndIsRead(user.getId(), 0);

        long newPaperCount = 0;
        java.util.List<java.util.Map<String, Object>> trendData = new java.util.ArrayList<>();
        List<String> followedTopicNames = new java.util.ArrayList<>();

        // Lấy dữ liệu trend theo tháng (luôn luôn lấy Total)
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Object[]> totalResults = paperRepository.countAllPapersByDateRange(startDate);
        java.util.Map<LocalDate, java.util.Map<String, Object>> groupedByDate = new java.util.TreeMap<>();

        // Khởi tạo các ngày trống với 0 cho trường Total
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            java.util.Map<String, Object> dayMap = new java.util.HashMap<>();
            dayMap.put("date", String.valueOf(date.getDayOfMonth()));
            dayMap.put("Total", 0L);
            groupedByDate.put(date, dayMap);
        }

        // Đổ dữ liệu tổng tất cả bài báo theo ngày
        for (Object[] row : totalResults) {
            LocalDate date = (LocalDate) row[0];
            Long count = (Long) row[1];
            if (groupedByDate.containsKey(date)) {
                groupedByDate.get(date).put("Total", count);
            }
        }

        if (topicCount > 0) {
            List<Long> topicIds = userTopicRepository.findByUser(user).stream()
                    .map(ut -> ut.getTopic().getId())
                    .collect(Collectors.toList());

            followedTopicNames = userTopicRepository.findByUser(user).stream()
                    .map(ut -> ut.getTopic().getName())
                    .collect(Collectors.toList());

            // Đếm số bài báo mới được xuất bản trong ngày hôm nay thuộc các chủ đề user theo dõi
            newPaperCount = paperRepository.countByUserTopicsAndDate(topicIds, LocalDate.now());

            List<Object[]> queryResults = paperRepository.countPapersByTopicsAndDateRange(topicIds, startDate);

            // Cập nhật các ngày trống với các topic name (giá trị khởi tạo 0L)
            for (java.util.Map<String, Object> dayMap : groupedByDate.values()) {
                for (String topicName : followedTopicNames) {
                    dayMap.put(topicName, 0L);
                }
            }

            // Đổ dữ liệu theo topic
            for (Object[] row : queryResults) {
                LocalDate date = (LocalDate) row[0];
                String topicName = (String) row[1];
                Long count = (Long) row[2];

                if (groupedByDate.containsKey(date)) {
                    groupedByDate.get(date).put(topicName, count);
                }
            }
        }

        trendData.addAll(groupedByDate.values());

        return DashboardStatsDto.builder()
                .topicCount(topicCount)
                .newPaperCount(newPaperCount)
                .favoriteCount(favoriteCount)
                .notificationCount(notificationCount)
                .trendData(trendData)
                .followedTopicNames(followedTopicNames)
                .build();
    }
}
