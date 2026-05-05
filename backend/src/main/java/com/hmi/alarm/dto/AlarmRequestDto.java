package com.hmi.alarm.dto;

import com.hmi.alarm.entity.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating an Alarm.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmRequestDto {

    @NotBlank(message = "Alarm code must not be blank")
    @Size(min = 2, max = 50, message = "Alarm code must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Alarm code must be uppercase alphanumeric with underscores/hyphens")
    private String code;

    @NotBlank(message = "Alarm message must not be blank")
    @Size(min = 5, max = 255, message = "Alarm message must be between 5 and 255 characters")
    private String message;

    @NotNull(message = "Severity must not be null")
    private Severity severity;
}
