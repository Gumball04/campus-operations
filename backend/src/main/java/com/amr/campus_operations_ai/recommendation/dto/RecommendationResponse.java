package com.amr.campus_operations_ai.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for room recommendation.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecommendationResponse {
    private Long scheduleId;
    private String courseCode;
    private String courseName;
    private Integer studentCount;
    private String problem;
    private String currentRoom;
    private String recommendedRoom;
    private Integer capacity;
    private Integer score;
    private String reason;
}
