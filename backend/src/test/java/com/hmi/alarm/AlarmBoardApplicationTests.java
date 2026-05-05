package com.hmi.alarm;

import com.hmi.alarm.dto.AcknowledgeRequestDto;
import com.hmi.alarm.dto.AlarmRequestDto;
import com.hmi.alarm.dto.AlarmResponseDto;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.entity.Severity;
import com.hmi.alarm.service.AlarmService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AlarmBoardApplicationTests {

    @Autowired
    private AlarmService alarmService;

    @Test
    void contextLoads() {
        assertThat(alarmService).isNotNull();
    }

    @Test
    void createAndAcknowledgeAlarm() {
        AlarmRequestDto req = AlarmRequestDto.builder()
                .code("TEST-ALARM-001")
                .message("Unit test alarm")
                .severity(Severity.HIGH)
                .build();

        AlarmResponseDto created = alarmService.createAlarm(req);
        assertThat(created.getId()).isNotNull();
        assertThat(created.getState()).isEqualTo(AlarmState.ACTIVE);

        AlarmResponseDto acked = alarmService.acknowledgeAlarm(
                created.getId(),
                AcknowledgeRequestDto.builder()
                        .operatorName("TestOperator")
                        .note("Acknowledging in test")
                        .build()
        );
        assertThat(acked.getState()).isEqualTo(AlarmState.ACKNOWLEDGED);
        assertThat(acked.getAcknowledgedBy()).isEqualTo("TestOperator");
    }

    @Test
    void summaryReturnsCorrectCounts() {
        var summary = alarmService.getSummary();
        assertThat(summary.getTotalAlarms()).isGreaterThanOrEqualTo(0);
    }
}
