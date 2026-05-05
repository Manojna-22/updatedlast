package com.hmi.alarm.repository;

import com.hmi.alarm.entity.AlarmEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AlarmEvent Repository — audit trail for alarm state changes.
 */
@Repository
public interface AlarmEventRepository extends JpaRepository<AlarmEvent, Long> {

    List<AlarmEvent> findByAlarmIdOrderByTsDesc(Long alarmId);

    Page<AlarmEvent> findByAlarmIdOrderByTsDesc(Long alarmId, Pageable pageable);
}
