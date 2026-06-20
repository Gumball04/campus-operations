package com.amr.campus_operations_ai.student.service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import com.amr.campus_operations_ai.student.entity.Student;
import com.amr.campus_operations_ai.student.repository.StudentRepository;

@Service
public class StudentImportService {

    private final StudentRepository repo;

    public StudentImportService(StudentRepository repo) {
        this.repo = repo;
    }

    public List<Student> preview(InputStream pdfStream) throws Exception {
        List<Student> result = new ArrayList<>();
           byte[] bytes = pdfStream.readAllBytes();
           try (java.io.ByteArrayInputStream in = new java.io.ByteArrayInputStream(bytes);
               PDDocument doc = PDDocument.load(in)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            // Very simple parsing: lines containing student number and name
            String[] lines = text.split("\\r?\\n");
            for (String line : lines) {
                String s = line.trim();
                if (s.isEmpty()) continue;
                // naive: if line contains digits and letters separated by space
                if (s.matches(".*\\d{4,}.*")) {
                    String[] parts = s.split("\\s+", 2);
                    if (parts.length >= 2) {
                        String number = parts[0].replaceAll("[^0-9A-Za-z]", "");
                        String name = parts[1].trim();
                        Student st = Student.builder()
                                .studentNumber(number)
                                .fullName(name)
                                .createdAt(LocalDateTime.now())
                                .build();
                        result.add(st);
                    }
                }
            }
        }
        return result;
    }

    public List<Student> confirm(List<Student> students) {
        List<Student> saved = new ArrayList<>();
        for (Student s : students) {
            if (s.getStudentNumber() == null) continue;
            if (repo.existsByStudentNumber(s.getStudentNumber())) continue;
            s.setCreatedAt(LocalDateTime.now());
            saved.add(repo.save(s));
        }
        return saved;
    }
}
