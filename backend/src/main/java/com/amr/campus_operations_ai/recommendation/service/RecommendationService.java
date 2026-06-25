package com.amr.campus_operations_ai.recommendation.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.amr.campus_operations_ai.course.entity.Course;
import com.amr.campus_operations_ai.recommendation.dto.RecommendationResponse;
import com.amr.campus_operations_ai.room.entity.Room;
import com.amr.campus_operations_ai.room.repository.RoomRepository;
import com.amr.campus_operations_ai.schedule.entity.Schedule;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final ScheduleRepository scheduleRepository;

    private final RoomRepository roomRepository;

    public RecommendationResponse recommendForSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id " + scheduleId));
        return recommend(schedule, scheduleRepository.findAll());
    }

    public List<RecommendationResponse> recommendForAll() {
        List<Schedule> schedules = scheduleRepository.findAll();
        return schedules.stream()
                .map(schedule -> recommend(schedule, schedules))
                .sorted(Comparator.comparingInt(RecommendationResponse::getScore).reversed()
                        .thenComparing(RecommendationResponse::getScheduleId))
                .toList();
    }

    private RecommendationResponse recommend(Schedule schedule, List<Schedule> allSchedules) {
        Course course = schedule.getCourse();
        if (course == null) {
            throw new EntityNotFoundException("Course not found for schedule " + schedule.getId());
        }

        Room currentRoom = schedule.getRoom();
        if (currentRoom == null) {
            throw new EntityNotFoundException("Room not found for schedule " + schedule.getId());
        }

        int studentCount = Objects.requireNonNullElse(course.getStudentCount(), 0);
        boolean capacityIssue = studentCount > Objects.requireNonNullElse(currentRoom.getCapacity(), 0);
        boolean conflictIssue = hasRoomConflict(schedule, allSchedules, currentRoom.getId());
        String problem = buildProblemLabel(capacityIssue, conflictIssue);

        if (!capacityIssue && !conflictIssue) {
            return RecommendationResponse.builder()
                    .scheduleId(schedule.getId())
                    .courseCode(course.getCode())
                    .courseName(course.getName())
                    .studentCount(studentCount)
                    .problem(problem)
                    .currentRoom(currentRoom.getName())
                    .recommendedRoom(currentRoom.getName())
                    .capacity(currentRoom.getCapacity())
                    .score(0)
                    .reason("Current room already fits the class and has no scheduling conflict")
                    .build();
        }

        List<Room> candidates = roomRepository.findAll().stream()
                .filter(room -> room.getCapacity() != null && room.getCapacity() >= studentCount)
                .filter(room -> !Objects.equals(room.getId(), currentRoom.getId()))
                .filter(room -> isRoomAvailable(room, schedule, allSchedules))
                .sorted(Comparator.comparingInt((Room room) -> scoreRoom(room, studentCount, currentRoom))
                        .reversed()
                        .thenComparing(Room::getCapacity))
                .toList();

        if (candidates.isEmpty()) {
            return RecommendationResponse.builder()
                    .scheduleId(schedule.getId())
                    .courseCode(course.getCode())
                    .courseName(course.getName())
                    .studentCount(studentCount)
                    .problem(problem)
                    .currentRoom(currentRoom.getName())
                    .recommendedRoom(currentRoom.getName())
                    .capacity(currentRoom.getCapacity())
                    .score(0)
                    .reason("No better room is free during this time, so the current assignment needs attention")
                    .build();
        }

        Room best = candidates.get(0);
        int score = scoreRoom(best, studentCount, currentRoom);
        String reason = buildReason(best, currentRoom, studentCount, capacityIssue, conflictIssue);

        return RecommendationResponse.builder()
                .scheduleId(schedule.getId())
                .courseCode(course.getCode())
                .courseName(course.getName())
                .studentCount(studentCount)
                .problem(problem)
                .currentRoom(currentRoom.getName())
                .recommendedRoom(best.getName())
                .capacity(best.getCapacity())
                .score(score)
                .reason(reason)
                .build();
    }

    private boolean hasRoomConflict(Schedule schedule, List<Schedule> allSchedules, Long roomId) {
        return allSchedules.stream()
                .filter(other -> !Objects.equals(other.getId(), schedule.getId()))
                .anyMatch(other -> isConflict(schedule, other, roomId));
    }

    private boolean isRoomAvailable(Room room, Schedule target, List<Schedule> allSchedules) {
        return allSchedules.stream()
                .filter(other -> Objects.equals(other.getRoom().getId(), room.getId()))
                .filter(other -> !Objects.equals(other.getId(), target.getId()))
                .noneMatch(other -> isSameSlot(target, other));
    }

    private boolean isConflict(Schedule first, Schedule second, Long roomId) {
        return Objects.equals(roomId, second.getRoom().getId())
                && Objects.equals(first.getDay(), second.getDay())
                && isSameSlot(first, second);
    }

    private boolean isSameSlot(Schedule first, Schedule second) {
        return first.getStartTime().isBefore(second.getEndTime())
                && second.getStartTime().isBefore(first.getEndTime());
    }

    private int scoreRoom(Room room, int studentCount, Room currentRoom) {
        int slack = room.getCapacity() - studentCount;
        int score = 100;
        score -= Math.min(50, slack * 2);
        if (Objects.equals(room.getBuilding(), currentRoom.getBuilding())) {
            score += 15;
        }
        if (slack == 0) {
            score += 10;
        }
        if (room.getFloor() != null && currentRoom.getFloor() != null && Objects.equals(room.getFloor(), currentRoom.getFloor())) {
            score += 5;
        }
        return Math.max(score, 0);
    }

    private String buildProblemLabel(boolean capacityIssue, boolean conflictIssue) {
        if (capacityIssue && conflictIssue) {
            return "Capacity violation + schedule conflict";
        }
        if (capacityIssue) {
            return "Capacity violation";
        }
        if (conflictIssue) {
            return "Schedule conflict";
        }
        return "No action needed";
    }

    private String buildReason(Room best, Room currentRoom, int studentCount, boolean capacityIssue, boolean conflictIssue) {
        List<String> parts = new ArrayList<>();
        if (Objects.equals(best.getBuilding(), currentRoom.getBuilding())) {
            parts.add("same building");
        }
        int slack = best.getCapacity() - studentCount;
        if (slack == 0) {
            parts.add("exact capacity match");
        } else {
            parts.add(slack + " spare seats");
        }
        if (capacityIssue) {
            parts.add("fixes the capacity issue");
        }
        if (conflictIssue) {
            parts.add("avoids the room conflict");
        }
        return String.join(", ", parts);
    }
}
