package com.amr.campus_operations_ai.student.dto;

import java.time.LocalDateTime;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDto {
    private Long id;
    private String studentNumber;
    private String fullName;
    private String email;
    private String department;
    private LocalDateTime createdAt;
}
