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

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/room/{scheduleId}")
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
}
