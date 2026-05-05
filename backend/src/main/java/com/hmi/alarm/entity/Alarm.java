package com.hmi.alarm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Alarm Entity — maps to the 'alarms' table.
 * Each alarm has a code, message, severity and tracks acknowledgement state.
 */
@Entity
@Table(
    name = "alarms",
    indexes = {
        @Index(name = "idx_alarm_severity", columnList = "severity"),
        @Index(name = "idx_alarm_state",    columnList = "state")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "events")
public class Alarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "message", nullable = false, length = 255)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 20)
    @Builder.Default
    private AlarmState state = AlarmState.ACTIVE;

    @Column(name = "acknowledged_by", length = 100)
    private String acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "alarm", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AlarmEvent> events = new ArrayList<>();

    // ---- Convenience Methods ----

    public boolean isActive() {
        return AlarmState.ACTIVE.equals(this.state);
    }

    public boolean isCleared() {
        return AlarmState.CLEARED.equals(this.state);
    }
}
