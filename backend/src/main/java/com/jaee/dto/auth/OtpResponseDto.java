package com.jaee.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpResponseDto {
    /**
     * OTP code - only populated in dev mode when SMS is not configured.
     * In production, this will be null and the OTP is sent via SMS.
     */
    private String devOtp;
}
