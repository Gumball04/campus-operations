package com.amr.campus_operations_ai.student.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.amr.campus_operations_ai.student.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentNumber(String studentNumber);
    boolean existsByStudentNumber(String studentNumber);
    Page<Student> findByFullNameContainingIgnoreCaseOrStudentNumberContainingIgnoreCase(String name, String number, Pageable pageable);
}
