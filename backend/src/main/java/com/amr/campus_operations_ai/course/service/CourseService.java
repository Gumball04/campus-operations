package com.amr.campus_operations_ai.course.service;

import java.util.List;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.amr.campus_operations_ai.course.dto.CourseResponse;
import com.amr.campus_operations_ai.course.dto.CreateCourseRequest;
import com.amr.campus_operations_ai.course.dto.UpdateCourseRequest;
import com.amr.campus_operations_ai.course.entity.Course;
import com.amr.campus_operations_ai.course.repository.CourseRepository;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;

import lombok.RequiredArgsConstructor;

/**
 * Provides course management operations.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;

    private final ScheduleRepository scheduleRepository;

    /**
     * Creates a course.
     *
     * @param request course creation payload
     * @return created course
     */
    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        validateUniqueCode(request.getCode(), null);
        Course course = Course.builder()
                .code(request.getCode().trim())
                .name(request.getName().trim())
                .studentCount(request.getStudentCount())
                .build();
        return toResponse(courseRepository.save(course));
    }

    /**
     * Returns all courses.
     *
     * @return all courses
     */
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns a course by id.
     *
     * @param id course identifier
     * @return course
     */
    public CourseResponse getCourseById(Long id) {
        return toResponse(findCourseById(id));
    }

    /**
     * Updates a course.
     *
     * @param id course identifier
     * @param request course update payload
     * @return updated course
     */
    @Transactional
    public CourseResponse updateCourse(Long id, UpdateCourseRequest request) {
        Course course = findCourseById(id);
        validateUniqueCode(request.getCode(), course.getId());
        course.setCode(request.getCode().trim());
        course.setName(request.getName().trim());
        course.setStudentCount(request.getStudentCount());
        return toResponse(courseRepository.save(course));
    }

    /**
     * Deletes a course.
     *
     * @param id course identifier
     */
    @Transactional
    public void deleteCourse(Long id) {
        if (scheduleRepository.existsByCourseId(id)) {
            throw new IllegalArgumentException("Course cannot be deleted because it is assigned to schedules");
        }
        Course course = findCourseById(id);
        courseRepository.delete(course);
    }

    private void validateUniqueCode(String code, Long currentId) {
        Course existingCourse = courseRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
        if (existingCourse == null) {
            return;
        }
        if (currentId != null && existingCourse.getId().equals(currentId)) {
            return;
        }
        throw new IllegalArgumentException("Course code already exists");
    }

    private Course findCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id " + id));
    }

    private CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .studentCount(course.getStudentCount())
                .build();
    }
}
