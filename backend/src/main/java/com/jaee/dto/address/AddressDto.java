package com.jaee.dto.address;

import com.jaee.entity.Address;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {
    private Long id;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String country;
    private String zip;
    private String phone;
    private Boolean isDefault;

    public static AddressDto fromEntity(Address address) {
        return AddressDto.builder()
                .id(address.getId())
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .zip(address.getZip())
                .phone(address.getPhone())
                .isDefault(address.getIsDefault())
                .build();
    }

    public String toFormattedString() {
        StringBuilder sb = new StringBuilder();
        sb.append(line1);
        if (line2 != null && !line2.isBlank()) {
            sb.append(", ").append(line2);
        }
        sb.append("\n").append(city);
        if (state != null && !state.isBlank()) {
            sb.append(", ").append(state);
        }
        if (zip != null && !zip.isBlank()) {
            sb.append(" - ").append(zip);
        }
        sb.append("\n").append(country);
        if (phone != null && !phone.isBlank()) {
            sb.append("\nPhone: ").append(phone);
        }
        return sb.toString();
    }
}
