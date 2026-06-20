package com.amr.campus_operations_ai.schedule.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

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
public class ScheduleResponse {

    private Long id;

    private Long courseId;

    private String courseCode;

    private String courseName;

    private Integer studentCount;

    private Long roomId;

    private String roomName;

    private String building;

    private Integer floor;

    private Integer capacity;

    private DayOfWeek day;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
}
