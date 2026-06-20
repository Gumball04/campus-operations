package com.amr.campus_operations_ai.analytics.dto;

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
public class ScheduleConflictResponse {

    private Long firstScheduleId;

    private Long secondScheduleId;

    private Long roomId;

    private String roomName;

    private DayOfWeek day;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime firstStartTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime firstEndTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime secondStartTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime secondEndTime;

    private String message;
}
