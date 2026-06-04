package com.nmcnpm.scholarslate.controller;

import com.nmcnpm.scholarslate.dto.NotificationDto;
import com.nmcnpm.scholarslate.security.services.UserDetailsImpl;
import com.nmcnpm.scholarslate.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(notificationService.getUserNotifications(userDetails.getEmail()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        notificationService.markAsRead(id, userDetails.getEmail());
        return ResponseEntity.ok().build();
    }

    // API dành cho Admin hoặc test qua Postman để ép tạo thông báo ngay lập tức
    @PostMapping("/generate")
    public ResponseEntity<String> forceGenerateNotifications() {
        notificationService.generateDailyNotifications();
        return ResponseEntity.ok("Đã kích hoạt tạo thông báo thành công!");
    }
}
