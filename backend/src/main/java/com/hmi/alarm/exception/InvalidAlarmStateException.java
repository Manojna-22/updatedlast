package com.hmi.alarm.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an invalid alarm state transition is attempted.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidAlarmStateException extends RuntimeException {

    public InvalidAlarmStateException(String message) {
        super(message);
    }
}
