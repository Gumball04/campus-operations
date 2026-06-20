package com.amr.campus_operations_ai.schedule.service;

import java.time.LocalTime;
import java.util.List;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.amr.campus_operations_ai.course.entity.Course;
import com.amr.campus_operations_ai.course.repository.CourseRepository;
import com.amr.campus_operations_ai.room.entity.Room;
import com.amr.campus_operations_ai.room.repository.RoomRepository;
import com.amr.campus_operations_ai.schedule.dto.CreateScheduleRequest;
import com.amr.campus_operations_ai.schedule.dto.ScheduleResponse;
import com.amr.campus_operations_ai.schedule.dto.UpdateScheduleRequest;
import com.amr.campus_operations_ai.schedule.entity.Schedule;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;

import lombok.RequiredArgsConstructor;

/**
 * Provides schedule management operations.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    private final CourseRepository courseRepository;

    private final RoomRepository roomRepository;

    /**
     * Creates a schedule.
     *
     * @param request schedule creation payload
     * @return created schedule
     */
    @Transactional
    public ScheduleResponse createSchedule(CreateScheduleRequest request) {
        validateTimeRange(request.getStartTime(), request.getEndTime());
        Course course = findCourseById(request.getCourseId());
        Room room = findRoomById(request.getRoomId());

        Schedule schedule = Schedule.builder()
                .course(course)
                .room(room)
                .day(request.getDay())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        return toResponse(scheduleRepository.save(schedule));
    }

    /**
     * Returns all schedules.
     *
     * @return all schedules
     */
    public List<ScheduleResponse> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns a schedule by id.
     *
     * @param id schedule identifier
     * @return schedule
     */
    public ScheduleResponse getScheduleById(Long id) {
        return toResponse(findScheduleById(id));
    }

    /**
     * Updates a schedule.
     *
     * @param id schedule identifier
     * @param request schedule update payload
     * @return updated schedule
     */
    @Transactional
    public ScheduleResponse updateSchedule(Long id, UpdateScheduleRequest request) {
        validateTimeRange(request.getStartTime(), request.getEndTime());
        Schedule schedule = findScheduleById(id);
        Course course = findCourseById(request.getCourseId());
        Room room = findRoomById(request.getRoomId());

        schedule.setCourse(course);
        schedule.setRoom(room);
        schedule.setDay(request.getDay());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        return toResponse(scheduleRepository.save(schedule));
    }

    /**
     * Deletes a schedule.
     *
     * @param id schedule identifier
     */
    @Transactional
    public void deleteSchedule(Long id) {
        Schedule schedule = findScheduleById(id);
        scheduleRepository.delete(schedule);
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("startTime and endTime are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }
    }

    private Course findCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id " + id));
    }

    private Room findRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id " + id));
    }

    private Schedule findScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id " + id));
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .courseId(schedule.getCourse().getId())
                .courseCode(schedule.getCourse().getCode())
                .courseName(schedule.getCourse().getName())
                .studentCount(schedule.getCourse().getStudentCount())
                .roomId(schedule.getRoom().getId())
                .roomName(schedule.getRoom().getName())
                .building(schedule.getRoom().getBuilding())
                .floor(schedule.getRoom().getFloor())
                .capacity(schedule.getRoom().getCapacity())
                .day(schedule.getDay())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .build();
    }
}
