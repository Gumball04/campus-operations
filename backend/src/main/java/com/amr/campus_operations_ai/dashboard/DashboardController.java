package com.amr.campus_operations_ai.dashboard;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;

import com.amr.campus_operations_ai.course.repository.CourseRepository;
import com.amr.campus_operations_ai.room.repository.RoomRepository;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;
import com.amr.campus_operations_ai.student.repository.StudentRepository;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final StudentRepository students;
    private final RoomRepository rooms;
    private final CourseRepository courses;
    private final ScheduleRepository schedules;

    public DashboardController(StudentRepository students, RoomRepository rooms, CourseRepository courses, ScheduleRepository schedules) {
        this.students = students;
        this.rooms = rooms;
        this.courses = courses;
        this.schedules = schedules;
    }

    @GetMapping("/summary")
    @Operation(summary = "Dashboard summary", description = "Counts of students, rooms, courses, and schedules")
    public ResponseEntity<Map<String, Object>> summary() {
        Map<String, Object> m = new HashMap<>();
        m.put("totalStudents", students.count());
        m.put("totalRooms", rooms.count());
        m.put("totalCourses", courses.count());
        m.put("totalSchedules", schedules.count());
        return ResponseEntity.ok(m);
    }

    @GetMapping("/analytics")
    @Operation(summary = "Dashboard analytics", description = "Basic analytics: capacity violations and schedule conflicts")
    public ResponseEntity<Map<String, Object>> analytics() {
        Map<String, Object> m = new HashMap<>();
        // Basic placeholders: analytics service exists elsewhere
        m.put("capacityViolations", 0);
        m.put("scheduleConflicts", 0);
        return ResponseEntity.ok(m);
    }
}
