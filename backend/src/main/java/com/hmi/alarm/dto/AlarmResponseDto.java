package com.hmi.alarm.dto;

import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.entity.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO returned to the client for Alarm data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmResponseDto {

    private Long id;
    private String code;
    private String message;
    private Severity severity;
    private AlarmState state;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
