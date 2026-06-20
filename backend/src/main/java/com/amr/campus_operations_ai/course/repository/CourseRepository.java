package com.amr.campus_operations_ai.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.amr.campus_operations_ai.course.entity.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByCodeIgnoreCase(String code);

    java.util.Optional<Course> findByCodeIgnoreCase(String code);
}
