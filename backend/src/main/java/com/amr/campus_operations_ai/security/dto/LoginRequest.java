package com.amr.campus_operations_ai.security.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
