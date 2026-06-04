package com.nmcnpm.scholarslate.controller;

import com.nmcnpm.scholarslate.dto.DashboardStatsDto;
import com.nmcnpm.scholarslate.security.services.UserDetailsImpl;
import com.nmcnpm.scholarslate.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(
            Authentication authentication,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        if (year != null && month != null) {
            return ResponseEntity.ok(dashboardService.getDashboardStats(userDetails.getEmail(), year, month));
        }
        return ResponseEntity.ok(dashboardService.getDashboardStats(userDetails.getEmail()));
    }
}
