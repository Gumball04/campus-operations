package com.amr.campus_operations_ai.analytics.dto;

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
public class RoomCapacityViolationResponse {

    private Long scheduleId;

    private Long courseId;

    private String courseCode;

    private String courseName;

    private Integer studentCount;

    private Long roomId;

    private String roomName;

    private Integer capacity;

    private String message;
}
