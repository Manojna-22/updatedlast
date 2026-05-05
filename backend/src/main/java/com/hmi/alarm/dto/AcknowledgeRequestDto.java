package com.hmi.alarm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for acknowledging an alarm.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcknowledgeRequestDto {

    @NotBlank(message = "Operator name must not be blank")
    @Size(min = 2, max = 100, message = "Operator name must be between 2 and 100 characters")
    private String operatorName;

    @Size(max = 500, message = "Note must not exceed 500 characters")
    private String note;
}
