package com.hmi.alarm.repository;

import com.hmi.alarm.entity.Alarm;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.entity.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Alarm Repository — Spring Data JPA with custom JPQL queries.
 */
@Repository
public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    Optional<Alarm> findByCode(String code);

    boolean existsByCode(String code);

    // Filter by severity
    Page<Alarm> findBySeverity(Severity severity, Pageable pageable);

    // Filter by state
    Page<Alarm> findByState(AlarmState state, Pageable pageable);

    // Filter by severity AND state
    Page<Alarm> findBySeverityAndState(Severity severity, AlarmState state, Pageable pageable);

    // Active alarms only
    List<Alarm> findByState(AlarmState state);

    // Count active vs cleared
    long countByState(AlarmState state);

    // Count by severity
    long countBySeverity(Severity severity);

    // Count by severity for active alarms
    long countBySeverityAndState(Severity severity, AlarmState state);

    // Summary: active count grouped by severity
    @Query("SELECT a.severity AS severity, COUNT(a) AS count FROM Alarm a WHERE a.state = 'ACTIVE' GROUP BY a.severity")
    List<Map<String, Object>> countActiveBySeverity();

    // Summary: all counts grouped by state
    @Query("SELECT a.state AS state, COUNT(a) AS count FROM Alarm a GROUP BY a.state")
    List<Map<String, Object>> countByStateGrouped();

    // Search alarms by keyword in code or message
    @Query("SELECT a FROM Alarm a WHERE LOWER(a.code) LIKE LOWER(CONCAT('%',:keyword,'%')) OR LOWER(a.message) LIKE LOWER(CONCAT('%',:keyword,'%'))")
    Page<Alarm> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
