package com.nmcnpm.scholarslate.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String userName;
    private String password;
    private String email;
    private LocalDateTime createdAt;
}
