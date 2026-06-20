package com.amr.campus_operations_ai.security.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String role; // ADMIN or STAFF
}
