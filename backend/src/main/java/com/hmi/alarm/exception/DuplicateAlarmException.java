package com.hmi.alarm.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when trying to create an alarm with a duplicate code.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateAlarmException extends RuntimeException {

    public DuplicateAlarmException(String code) {
        super(String.format("Alarm with code '%s' already exists", code));
    }
}
