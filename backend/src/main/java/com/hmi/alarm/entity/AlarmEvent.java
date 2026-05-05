package com.hmi.alarm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * AlarmEvent Entity — records every state transition of an alarm.
 * Maps to the 'alarm_events' table.
 */
@Entity
@Table(
    name = "alarm_events",
    indexes = {
        @Index(name = "idx_event_alarm_id", columnList = "alarm_id"),
        @Index(name = "idx_event_ts",       columnList = "ts")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlarmEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alarm_id", nullable = false)
    private Alarm alarm;

    @CreationTimestamp
    @Column(name = "ts", nullable = false, updatable = false)
    private LocalDateTime ts;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 20)
    private AlarmState state;

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(name = "note", length = 500)
    private String note;
}
