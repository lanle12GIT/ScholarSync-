package com.nmcnpm.scholarslate.controller;

import com.nmcnpm.scholarslate.entity.User;
import com.nmcnpm.scholarslate.repository.UserRepository;
import com.nmcnpm.scholarslate.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    /** Thông tin tài khoản đang đăng nhập (dùng cho tab Profile của Account modal). */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> body = new HashMap<>();
        body.put("userName", user.getUserName());
        body.put("email", user.getEmail());
        body.put("createdAt", user.getCreatedAt());
        return ResponseEntity.ok(body);
    }

    /** Đổi mật khẩu: kiểm tra mật khẩu hiện tại rồi cập nhật mật khẩu mới. */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> req,
                                            Authentication authentication) {
        String currentPassword = req.get("currentPassword");
        String newPassword = req.get("newPassword");

        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body("New password must be at least 6 characters.");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentPassword == null || !encoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect.");
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully!");
    }
}
