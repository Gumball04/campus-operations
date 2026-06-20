package com.amr.campus_operations_ai.recommendation.service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;

import com.amr.campus_operations_ai.course.entity.Course;
import com.amr.campus_operations_ai.recommendation.dto.RecommendationResponse;
import com.amr.campus_operations_ai.room.entity.Room;
import com.amr.campus_operations_ai.room.repository.RoomRepository;
import com.amr.campus_operations_ai.schedule.entity.Schedule;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ScheduleRepository scheduleRepository;

    private final RoomRepository roomRepository;

    public RecommendationResponse recommendForSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id " + scheduleId));

        Course course = schedule.getCourse();
        if (course == null) {
            throw new EntityNotFoundException("Course not found for schedule " + scheduleId);
        }

        Room currentRoom = schedule.getRoom();
        if (currentRoom == null) {
            throw new EntityNotFoundException("Room not found for schedule " + scheduleId);
        }

        int studentCount = Objects.requireNonNullElse(course.getStudentCount(), 0);
        String currentBuilding = currentRoom.getBuilding();

        List<Room> candidates = roomRepository.findAll().stream()
                .filter(r -> r.getCapacity() != null && r.getCapacity() >= studentCount)
                .filter(r -> !Objects.equals(r.getId(), currentRoom.getId()))
                .sorted(Comparator.comparingInt(Room::getCapacity)
                        .thenComparingInt(r -> r.getBuilding() != null && r.getBuilding().equals(currentBuilding) ? 0 : 1))
                .toList();

        if (candidates.isEmpty()) {
            return RecommendationResponse.builder()
                    .currentRoom(currentRoom.getName())
                    .recommendedRoom(null)
                    .capacity(null)
                    .reason("No suitable room found")
                    .build();
        }

        Room best = candidates.get(0);
        String reason = best.getCapacity().equals(studentCount) ? "Exact capacity match" : "Best capacity match";
        if (best.getBuilding() != null && best.getBuilding().equals(currentBuilding)) {
            reason += " (same building preferred)";
        }

        return RecommendationResponse.builder()
                .currentRoom(currentRoom.getName())
                .recommendedRoom(best.getName())
                .capacity(best.getCapacity())
                .reason(reason)
                .build();
    }

    public java.util.List<RecommendationResponse> recommendForAll() {
        return scheduleRepository.findAll().stream()
                .map(s -> recommendForSchedule(s.getId()))
                .toList();
    }
}
