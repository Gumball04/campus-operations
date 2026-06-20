package com.amr.campus_operations_ai.student.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;

import com.amr.campus_operations_ai.student.entity.Student;
import com.amr.campus_operations_ai.student.service.StudentImportService;

@RestController
@RequestMapping("/api/students/import")
@SecurityRequirement(name = "bearerAuth")
public class StudentImportController {

    private final StudentImportService importService;

    public StudentImportController(StudentImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/preview")
    @Operation(summary = "Preview student import", description = "Upload PDF to preview parsed students")
    public ResponseEntity<List<Student>> preview(@RequestPart("file") MultipartFile file) throws Exception {
        List<Student> preview = importService.preview(file.getInputStream());
        return ResponseEntity.ok(preview);
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirm student import", description = "Upload PDF to parse and save students. Prevents duplicates.")
    public ResponseEntity<List<Student>> confirm(@RequestPart("file") MultipartFile file) throws Exception {
        List<Student> preview = importService.preview(file.getInputStream());
        List<Student> saved = importService.confirm(preview);
        return ResponseEntity.ok(saved);
    }
}
