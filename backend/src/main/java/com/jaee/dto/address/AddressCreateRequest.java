package com.jaee.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressCreateRequest {

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255)
    private String line1;

    @Size(max = 255)
    private String line2;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @NotBlank(message = "Country is required")
    @Size(max = 100)
    private String country;

    @Size(max = 20)
    private String zip;

    @Size(max = 20)
    private String phone;

    private Boolean isDefault = false;
}
