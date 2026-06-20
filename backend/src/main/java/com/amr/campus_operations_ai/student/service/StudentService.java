package com.amr.campus_operations_ai.student.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.amr.campus_operations_ai.student.dto.StudentDto;
import com.amr.campus_operations_ai.student.entity.Student;
import com.amr.campus_operations_ai.student.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository repo;

    public StudentService(StudentRepository repo) {
        this.repo = repo;
    }

    public Page<Student> list(int page, int size) {
        return repo.findAll(PageRequest.of(page, size));
    }

    public Page<Student> search(String q, int page, int size) {
        return repo.findByFullNameContainingIgnoreCaseOrStudentNumberContainingIgnoreCase(q, q, PageRequest.of(page, size));
    }

    public Optional<Student> get(Long id) {
        return repo.findById(id);
    }

    public Student create(StudentDto dto) {
        Student s = Student.builder()
                .studentNumber(dto.getStudentNumber())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .department(dto.getDepartment())
                .createdAt(LocalDateTime.now())
                .build();
        return repo.save(s);
    }

    public Optional<Student> update(Long id, StudentDto dto) {
        return repo.findById(id).map(s -> {
            s.setFullName(dto.getFullName());
            s.setEmail(dto.getEmail());
            s.setDepartment(dto.getDepartment());
            return repo.save(s);
        });
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
