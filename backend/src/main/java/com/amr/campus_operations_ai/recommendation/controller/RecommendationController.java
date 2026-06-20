package com.amr.campus_operations_ai.recommendation.controller;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.amr.campus_operations_ai.recommendation.dto.RecommendationResponse;
import com.amr.campus_operations_ai.recommendation.service.RecommendationService;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/room/{scheduleId}")
    @Operation(summary = "Recommend room for schedule", description = "Recommend a better room for the given schedule id")
    public ResponseEntity<RecommendationResponse> recommendRoom(@PathVariable Long scheduleId) {
        try {
            RecommendationResponse resp = recommendationService.recommendForSchedule(scheduleId);
            if (resp.getRecommendedRoom() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
            }
            return ResponseEntity.ok(resp);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    @Operation(summary = "Recommendations for all schedules", description = "Return recommendations for all schedules")
    public ResponseEntity<java.util.List<RecommendationResponse>> all() {
        return ResponseEntity.ok(recommendationService.recommendForAll());
    }
}
