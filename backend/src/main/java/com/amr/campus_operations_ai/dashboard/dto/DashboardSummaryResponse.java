package com.amr.campus_operations_ai.dashboard.dto;

import java.util.ArrayList;
import java.util.List;

import com.amr.campus_operations_ai.recommendation.dto.RecommendationResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private long totalStudents;

    private long totalRooms;

    private long totalCourses;

    private long totalSchedules;

    private long capacityViolations;

    private long scheduleConflicts;

    @Builder.Default
    private List<RecommendationResponse> topRecommendations = new ArrayList<>();
}
