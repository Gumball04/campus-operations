package com.amr.campus_operations_ai.student.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.*;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String studentNumber;

    @NotBlank
    @Size(max = 255)
    private String fullName;

    @Email
    @Column(unique = true)
    private String email;

    private String department;

    private LocalDateTime createdAt;
}
