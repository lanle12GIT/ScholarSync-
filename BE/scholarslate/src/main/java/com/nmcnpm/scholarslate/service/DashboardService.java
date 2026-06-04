package com.nmcnpm.scholarslate.service;

import com.nmcnpm.scholarslate.dto.DashboardStatsDto;

public interface DashboardService {
    DashboardStatsDto getDashboardStats(String email);
    DashboardStatsDto getDashboardStats(String email, int year, int month);
}
