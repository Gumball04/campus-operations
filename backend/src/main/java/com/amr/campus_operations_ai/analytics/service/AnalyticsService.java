package com.amr.campus_operations_ai.analytics.service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.amr.campus_operations_ai.analytics.dto.RoomCapacityViolationResponse;
import com.amr.campus_operations_ai.analytics.dto.ScheduleConflictResponse;
import com.amr.campus_operations_ai.schedule.entity.Schedule;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;

import lombok.RequiredArgsConstructor;

/**
 * Provides operational analytics for campus schedules.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ScheduleRepository scheduleRepository;

    /**
     * Detects schedules where a course exceeds room capacity.
     *
     * @return capacity violation alerts
     */
    public List<RoomCapacityViolationResponse> detectRoomCapacityViolations() {
        return scheduleRepository.findAll().stream()
                .filter(schedule -> schedule.getCourse().getStudentCount() > schedule.getRoom().getCapacity())
                .map(this::toCapacityViolationResponse)
                .toList();
    }

    /**
     * Detects overlapping schedules in the same room on the same day.
     *
     * @return schedule conflict alerts
     */
    public List<ScheduleConflictResponse> detectScheduleConflicts() {
        List<Schedule> schedules = scheduleRepository.findAll();
        List<ScheduleConflictResponse> conflicts = new ArrayList<>();

        for (int i = 0; i < schedules.size(); i++) {
            Schedule first = schedules.get(i);
            for (int j = i + 1; j < schedules.size(); j++) {
                Schedule second = schedules.get(j);
                if (isConflict(first, second)) {
                    conflicts.add(toConflictResponse(first, second));
                }
            }
        }

        return conflicts;
    }

    private boolean isConflict(Schedule first, Schedule second) {
        boolean sameRoom = first.getRoom().getId().equals(second.getRoom().getId());
        boolean sameDay = first.getDay().equals(second.getDay());
        boolean overlapping = overlaps(first.getStartTime(), first.getEndTime(), second.getStartTime(), second.getEndTime());
        return sameRoom && sameDay && overlapping;
    }

    private boolean overlaps(LocalTime firstStart, LocalTime firstEnd, LocalTime secondStart, LocalTime secondEnd) {
        return firstStart.isBefore(secondEnd) && secondStart.isBefore(firstEnd);
    }

    private RoomCapacityViolationResponse toCapacityViolationResponse(Schedule schedule) {
        return RoomCapacityViolationResponse.builder()
                .scheduleId(schedule.getId())
                .courseId(schedule.getCourse().getId())
                .courseCode(schedule.getCourse().getCode())
                .courseName(schedule.getCourse().getName())
                .studentCount(schedule.getCourse().getStudentCount())
                .roomId(schedule.getRoom().getId())
                .roomName(schedule.getRoom().getName())
                .capacity(schedule.getRoom().getCapacity())
                .message(String.format(
                        "Course %s exceeds room %s capacity",
                        schedule.getCourse().getCode(),
                        schedule.getRoom().getName()))
                .build();
    }

    private ScheduleConflictResponse toConflictResponse(Schedule first, Schedule second) {
        return ScheduleConflictResponse.builder()
                .firstScheduleId(first.getId())
                .secondScheduleId(second.getId())
                .roomId(first.getRoom().getId())
                .roomName(first.getRoom().getName())
                .day(first.getDay())
                .firstStartTime(first.getStartTime())
                .firstEndTime(first.getEndTime())
                .secondStartTime(second.getStartTime())
                .secondEndTime(second.getEndTime())
                .message(String.format(
                        "Schedules %d and %d conflict in room %s on %s",
                        first.getId(),
                        second.getId(),
                        first.getRoom().getName(),
                        first.getDay()))
                .build();
    }
}
