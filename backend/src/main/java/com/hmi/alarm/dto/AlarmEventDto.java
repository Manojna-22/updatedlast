package com.hmi.alarm.dto;

import com.hmi.alarm.entity.AlarmState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for AlarmEvent (audit trail entry).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmEventDto {

    private Long id;
    private Long alarmId;
    private LocalDateTime ts;
    private AlarmState state;
    private String performedBy;
    private String note;
}
