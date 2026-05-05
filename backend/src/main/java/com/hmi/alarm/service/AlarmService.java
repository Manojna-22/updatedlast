package com.hmi.alarm.service;

import com.hmi.alarm.dto.*;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.entity.Severity;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * AlarmService — defines all business operations for the Alarm domain.
 */
public interface AlarmService {

    // ---- CRUD ----

    AlarmResponseDto createAlarm(AlarmRequestDto request);

    AlarmResponseDto getAlarmById(Long id);

    AlarmResponseDto getAlarmByCode(String code);

    PagedResponse<AlarmResponseDto> getAllAlarms(Pageable pageable);

    PagedResponse<AlarmResponseDto> getAlarmsBySeverity(Severity severity, Pageable pageable);

    PagedResponse<AlarmResponseDto> getAlarmsByState(AlarmState state, Pageable pageable);

    PagedResponse<AlarmResponseDto> getAlarmsBySeverityAndState(Severity severity, AlarmState state, Pageable pageable);

    PagedResponse<AlarmResponseDto> searchAlarms(String keyword, Pageable pageable);

    AlarmResponseDto updateAlarm(Long id, AlarmRequestDto request);

    void deleteAlarm(Long id);

    // ---- Business Operations ----

    AlarmResponseDto acknowledgeAlarm(Long id, AcknowledgeRequestDto request);

    AlarmResponseDto clearAlarm(Long id, String operatorName);

    AlarmResponseDto raiseAlarm(String code);

    // ---- Events ----

    List<AlarmEventDto> getAlarmEvents(Long alarmId);

    // ---- Summary ----

    AlarmSummaryDto getSummary();

    // ---- Scheduler Utility ----

    void generateRandomAlarm();
}
