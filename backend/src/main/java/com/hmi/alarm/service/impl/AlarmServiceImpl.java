package com.hmi.alarm.service.impl;

import com.hmi.alarm.dto.*;
import com.hmi.alarm.entity.*;
import com.hmi.alarm.exception.*;
import com.hmi.alarm.repository.AlarmEventRepository;
import com.hmi.alarm.repository.AlarmRepository;
import com.hmi.alarm.service.AlarmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * AlarmServiceImpl — full implementation of AlarmService.
 * Handles all business logic: CRUD, state machine transitions, events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AlarmServiceImpl implements AlarmService {

    private final AlarmRepository     alarmRepository;
    private final AlarmEventRepository alarmEventRepository;
    private final ModelMapper          modelMapper;

    private static final Random RANDOM = new Random();

    private static final String[] SAMPLE_MESSAGES = {
        "Temperature sensor threshold exceeded",
        "Pressure valve failure detected",
        "Network communication timeout",
        "Motor overload condition",
        "Low hydraulic fluid level",
        "Emergency stop activated",
        "PLC heartbeat lost",
        "Conveyor belt jam detected",
        "Power supply voltage drop",
        "Cooling fan failure"
    };

    // ===========================
    // CRUD Operations
    // ===========================

    @Override
    public AlarmResponseDto createAlarm(AlarmRequestDto request) {
        log.info("Creating alarm with code: {}", request.getCode());

        if (alarmRepository.existsByCode(request.getCode())) {
            throw new DuplicateAlarmException(request.getCode());
        }

        Alarm alarm = Alarm.builder()
                .code(request.getCode())
                .message(request.getMessage())
                .severity(request.getSeverity())
                .state(AlarmState.ACTIVE)
                .build();

        alarm = alarmRepository.save(alarm);
        recordEvent(alarm, AlarmState.ACTIVE, "SYSTEM", "Alarm raised");

        log.info("Alarm created with id: {}", alarm.getId());
        return toDto(alarm);
    }

    @Override
    @Transactional(readOnly = true)
    public AlarmResponseDto getAlarmById(Long id) {
        return toDto(findAlarmById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public AlarmResponseDto getAlarmByCode(String code) {
        return toDto(alarmRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm", "code", code)));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AlarmResponseDto> getAllAlarms(Pageable pageable) {
        Page<AlarmResponseDto> page = alarmRepository.findAll(pageable).map(this::toDto);
        return PagedResponse.of(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AlarmResponseDto> getAlarmsBySeverity(Severity severity, Pageable pageable) {
        return PagedResponse.of(alarmRepository.findBySeverity(severity, pageable).map(this::toDto));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AlarmResponseDto> getAlarmsByState(AlarmState state, Pageable pageable) {
        return PagedResponse.of(alarmRepository.findByState(state, pageable).map(this::toDto));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AlarmResponseDto> getAlarmsBySeverityAndState(Severity severity, AlarmState state, Pageable pageable) {
        return PagedResponse.of(alarmRepository.findBySeverityAndState(severity, state, pageable).map(this::toDto));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AlarmResponseDto> searchAlarms(String keyword, Pageable pageable) {
        return PagedResponse.of(alarmRepository.searchByKeyword(keyword, pageable).map(this::toDto));
    }

    @Override
    public AlarmResponseDto updateAlarm(Long id, AlarmRequestDto request) {
        log.info("Updating alarm id: {}", id);
        Alarm alarm = findAlarmById(id);

        // Check for code conflicts if code is being changed
        if (!alarm.getCode().equals(request.getCode()) && alarmRepository.existsByCode(request.getCode())) {
            throw new DuplicateAlarmException(request.getCode());
        }

        alarm.setCode(request.getCode());
        alarm.setMessage(request.getMessage());
        alarm.setSeverity(request.getSeverity());

        return toDto(alarmRepository.save(alarm));
    }

    @Override
    public void deleteAlarm(Long id) {
        log.info("Deleting alarm id: {}", id);
        Alarm alarm = findAlarmById(id);
        alarmRepository.delete(alarm);
    }

    // ===========================
    // Business Operations (State Machine)
    // ===========================

    @Override
    public AlarmResponseDto acknowledgeAlarm(Long id, AcknowledgeRequestDto request) {
        log.info("Acknowledging alarm id: {} by {}", id, request.getOperatorName());
        Alarm alarm = findAlarmById(id);

        if (!alarm.isActive()) {
            throw new InvalidAlarmStateException(
                String.format("Alarm '%s' cannot be acknowledged from state '%s'. Only ACTIVE alarms can be acknowledged.",
                    alarm.getCode(), alarm.getState())
            );
        }

        alarm.setState(AlarmState.ACKNOWLEDGED);
        alarm.setAcknowledgedBy(request.getOperatorName());
        alarm.setAcknowledgedAt(LocalDateTime.now());

        alarm = alarmRepository.save(alarm);
        recordEvent(alarm, AlarmState.ACKNOWLEDGED, request.getOperatorName(), request.getNote());

        return toDto(alarm);
    }

    @Override
    public AlarmResponseDto clearAlarm(Long id, String operatorName) {
        log.info("Clearing alarm id: {} by {}", id, operatorName);
        Alarm alarm = findAlarmById(id);

        if (alarm.isCleared()) {
            throw new InvalidAlarmStateException(
                String.format("Alarm '%s' is already CLEARED.", alarm.getCode())
            );
        }

        alarm.setState(AlarmState.CLEARED);
        alarm = alarmRepository.save(alarm);
        recordEvent(alarm, AlarmState.CLEARED, operatorName, "Alarm cleared");

        return toDto(alarm);
    }

    @Override
    public AlarmResponseDto raiseAlarm(String code) {
        log.info("Re-raising alarm with code: {}", code);
        Alarm alarm = alarmRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm", "code", code));

        alarm.setState(AlarmState.ACTIVE);
        alarm.setAcknowledgedBy(null);
        alarm.setAcknowledgedAt(null);
        alarm = alarmRepository.save(alarm);
        recordEvent(alarm, AlarmState.ACTIVE, "SYSTEM", "Alarm re-raised");

        return toDto(alarm);
    }

    // ===========================
    // Events
    // ===========================

    @Override
    @Transactional(readOnly = true)
    public List<AlarmEventDto> getAlarmEvents(Long alarmId) {
        findAlarmById(alarmId); // ensure it exists
        return alarmEventRepository.findByAlarmIdOrderByTsDesc(alarmId)
                .stream()
                .map(e -> modelMapper.map(e, AlarmEventDto.class))
                .toList();
    }

    // ===========================
    // Summary
    // ===========================

    @Override
    @Transactional(readOnly = true)
    public AlarmSummaryDto getSummary() {
        long total        = alarmRepository.count();
        long active       = alarmRepository.countByState(AlarmState.ACTIVE);
        long acknowledged = alarmRepository.countByState(AlarmState.ACKNOWLEDGED);
        long cleared      = alarmRepository.countByState(AlarmState.CLEARED);

        return AlarmSummaryDto.builder()
                .totalAlarms(total)
                .activeCount(active)
                .acknowledgedCount(acknowledged)
                .clearedCount(cleared)
                .activeLow(alarmRepository.countBySeverityAndState(Severity.LOW, AlarmState.ACTIVE))
                .activeMedium(alarmRepository.countBySeverityAndState(Severity.MEDIUM, AlarmState.ACTIVE))
                .activeHigh(alarmRepository.countBySeverityAndState(Severity.HIGH, AlarmState.ACTIVE))
                .activeCritical(alarmRepository.countBySeverityAndState(Severity.CRITICAL, AlarmState.ACTIVE))
                .build();
    }

    // ===========================
    // Scheduler — generates random alarms periodically
    // ===========================

    @Override
    @Scheduled(fixedDelayString = "${alarm.scheduler.interval-ms:10000}")
    public void generateRandomAlarm() {
        if (!Boolean.parseBoolean(System.getProperty("alarm.scheduler.enabled", "true"))) return;

        String code     = "ALM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String message  = SAMPLE_MESSAGES[RANDOM.nextInt(SAMPLE_MESSAGES.length)];
        Severity sev    = Severity.values()[RANDOM.nextInt(Severity.values().length)];

        Alarm alarm = Alarm.builder()
                .code(code)
                .message(message)
                .severity(sev)
                .state(AlarmState.ACTIVE)
                .build();

        alarm = alarmRepository.save(alarm);
        recordEvent(alarm, AlarmState.ACTIVE, "SCHEDULER", "Auto-generated alarm");
        log.debug("Scheduler generated alarm: {} [{}]", code, sev);
    }

    // ===========================
    // Private Helpers
    // ===========================

    private Alarm findAlarmById(Long id) {
        return alarmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm", "id", id));
    }

    private void recordEvent(Alarm alarm, AlarmState state, String performedBy, String note) {
        AlarmEvent event = AlarmEvent.builder()
                .alarm(alarm)
                .state(state)
                .performedBy(performedBy)
                .note(note)
                .build();
        alarmEventRepository.save(event);
    }

    private AlarmResponseDto toDto(Alarm alarm) {
        return modelMapper.map(alarm, AlarmResponseDto.class);
    }
}
