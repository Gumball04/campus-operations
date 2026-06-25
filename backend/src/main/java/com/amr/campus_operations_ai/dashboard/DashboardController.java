package com.amr.campus_operations_ai.dashboard;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.amr.campus_operations_ai.analytics.service.AnalyticsService;
import com.amr.campus_operations_ai.common.response.ApiResponse;
import com.amr.campus_operations_ai.course.repository.CourseRepository;
import com.amr.campus_operations_ai.dashboard.dto.DashboardSummaryResponse;
import com.amr.campus_operations_ai.recommendation.service.RecommendationService;
import com.amr.campus_operations_ai.room.repository.RoomRepository;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;
import com.amr.campus_operations_ai.student.repository.StudentRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class DashboardController {

    private final StudentRepository students;
    private final RoomRepository rooms;
    private final CourseRepository courses;
    private final ScheduleRepository schedules;
    private final AnalyticsService analyticsService;
    private final RecommendationService recommendationService;

    @GetMapping("/summary")
    @Operation(summary = "Dashboard summary", description = "Counts of students, rooms, courses, schedules, and top recommendations")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> summary() {
        DashboardSummaryResponse response = DashboardSummaryResponse.builder()
                .totalStudents(students.count())
                .totalRooms(rooms.count())
                .totalCourses(courses.count())
                .totalSchedules(schedules.count())
                .capacityViolations(analyticsService.countRoomCapacityViolations())
                .scheduleConflicts(analyticsService.countScheduleConflicts())
                .topRecommendations(recommendationService.recommendForAll().stream()
                        .filter(r -> r.getScore() > 0)
                        .limit(3)
                        .toList())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved successfully", response));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Dashboard analytics", description = "Real analytics counts for capacity violations and schedule conflicts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("capacityViolations", analyticsService.countRoomCapacityViolations());
        analytics.put("scheduleConflicts", analyticsService.countScheduleConflicts());
        return ResponseEntity.ok(ApiResponse.success("Dashboard analytics retrieved successfully", analytics));
    }
}
