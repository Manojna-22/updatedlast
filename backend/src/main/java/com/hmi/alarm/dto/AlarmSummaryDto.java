package com.hmi.alarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for dashboard summary statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmSummaryDto {

    private long totalAlarms;
    private long activeCount;
    private long acknowledgedCount;
    private long clearedCount;

    // Counts by severity (active only)
    private long activeLow;
    private long activeMedium;
    private long activeHigh;
    private long activeCritical;
}
