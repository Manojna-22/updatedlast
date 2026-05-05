package com.hmi.alarm.controller;

import com.hmi.alarm.dto.*;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.entity.Severity;
import com.hmi.alarm.service.AlarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AlarmController — REST API for HMI Alarm Board.
 * Base URL: /api/alarms
 */
@RestController
@RequestMapping("/alarms")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Alarms", description = "HMI Alarm Acknowledgement Board API")
public class AlarmController {

    private final AlarmService alarmService;

    // ===========================
    // CRUD Endpoints
    // ===========================

    @PostMapping
    @Operation(summary = "Create a new alarm")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> createAlarm(
            @Valid @RequestBody AlarmRequestDto request) {
        AlarmResponseDto dto = alarmService.createAlarm(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alarm by ID")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> getAlarmById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(alarmService.getAlarmById(id)));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get alarm by code")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> getAlarmByCode(
            @PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(alarmService.getAlarmByCode(code)));
    }

    @GetMapping
    @Operation(summary = "Get all alarms with pagination and optional filters")
    public ResponseEntity<ApiResponse<PagedResponse<AlarmResponseDto>>> getAllAlarms(
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) AlarmState state,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort     = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<AlarmResponseDto> result;

        if (keyword != null && !keyword.isBlank()) {
            result = alarmService.searchAlarms(keyword, pageable);
        } else if (severity != null && state != null) {
            result = alarmService.getAlarmsBySeverityAndState(severity, state, pageable);
        } else if (severity != null) {
            result = alarmService.getAlarmsBySeverity(severity, pageable);
        } else if (state != null) {
            result = alarmService.getAlarmsByState(state, pageable);
        } else {
            result = alarmService.getAllAlarms(pageable);
        }

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an alarm")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> updateAlarm(
            @PathVariable Long id,
            @Valid @RequestBody AlarmRequestDto request) {
        return ResponseEntity.ok(ApiResponse.ok("Alarm updated", alarmService.updateAlarm(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an alarm")
    public ResponseEntity<ApiResponse<Void>> deleteAlarm(@PathVariable Long id) {
        alarmService.deleteAlarm(id);
        return ResponseEntity.ok(ApiResponse.ok("Alarm deleted", null));
    }

    // ===========================
    // Business Operations
    // ===========================

    @PatchMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge an active alarm")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> acknowledgeAlarm(
            @PathVariable Long id,
            @Valid @RequestBody AcknowledgeRequestDto request) {
        return ResponseEntity.ok(ApiResponse.ok("Alarm acknowledged", alarmService.acknowledgeAlarm(id, request)));
    }

    @PatchMapping("/{id}/clear")
    @Operation(summary = "Clear an alarm")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> clearAlarm(
            @PathVariable Long id,
            @Parameter(description = "Operator performing the action")
            @RequestParam(defaultValue = "OPERATOR") String operatorName) {
        return ResponseEntity.ok(ApiResponse.ok("Alarm cleared", alarmService.clearAlarm(id, operatorName)));
    }

    @PatchMapping("/{code}/raise")
    @Operation(summary = "Re-raise a cleared or acknowledged alarm by code")
    public ResponseEntity<ApiResponse<AlarmResponseDto>> raiseAlarm(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok("Alarm raised", alarmService.raiseAlarm(code)));
    }

    // ===========================
    // Events
    // ===========================

    @GetMapping("/{id}/events")
    @Operation(summary = "Get audit trail events for an alarm")
    public ResponseEntity<ApiResponse<List<AlarmEventDto>>> getAlarmEvents(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(alarmService.getAlarmEvents(id)));
    }

    // ===========================
    // Summary
    // ===========================

    @GetMapping("/summary")
    @Operation(summary = "Get alarm dashboard summary statistics")
    public ResponseEntity<ApiResponse<AlarmSummaryDto>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(alarmService.getSummary()));
    }
}
