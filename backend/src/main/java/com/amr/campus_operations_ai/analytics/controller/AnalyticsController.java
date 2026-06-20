package com.amr.campus_operations_ai.analytics.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.amr.campus_operations_ai.analytics.dto.RoomCapacityViolationResponse;
import com.amr.campus_operations_ai.analytics.dto.ScheduleConflictResponse;
import com.amr.campus_operations_ai.analytics.service.AnalyticsService;
import com.amr.campus_operations_ai.common.response.ApiResponse;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/capacity")
    public ResponseEntity<ApiResponse<List<RoomCapacityViolationResponse>>> detectRoomCapacityViolations() {
        return ResponseEntity.ok(ApiResponse.success(
                "Capacity violations retrieved successfully",
                analyticsService.detectRoomCapacityViolations()));
    }

    @GetMapping("/conflicts")
    public ResponseEntity<ApiResponse<List<ScheduleConflictResponse>>> detectScheduleConflicts() {
        return ResponseEntity.ok(ApiResponse.success(
                "Schedule conflicts retrieved successfully",
                analyticsService.detectScheduleConflicts()));
    }
}
