package com.nmcnpm.scholarslate.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String userName;
    private String email;

    public JwtResponse(String accessToken, Long id, String userName, String email) {
        this.token = accessToken;
        this.id = id;
        this.userName = userName;
        this.email = email;
    }
}
