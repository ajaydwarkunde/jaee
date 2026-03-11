package com.jaee.service;

import com.jaee.dto.candle.CustomCandleRequestDto;
import com.jaee.dto.candle.CustomCandleResponseDto;
import com.jaee.entity.CustomCandleRequest;
import com.jaee.entity.CustomCandleRequest.Status;
import com.jaee.entity.User;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.CustomCandleRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomCandleService {

    private final CustomCandleRequestRepository customCandleRequestRepository;

    @Transactional
    public CustomCandleResponseDto createRequest(CustomCandleRequestDto dto, User user) {
        BigDecimal estimatedPrice = calculateEstimatedPrice(dto);

        CustomCandleRequest entity = CustomCandleRequest.builder()
                .user(user)
                .customerName(dto.getCustomerName())
                .customerEmail(dto.getCustomerEmail())
                .customerPhone(dto.getCustomerPhone())
                .size(dto.getSize())
                .waxType(dto.getWaxType())
                .scent(dto.getScent())
                .color(dto.getColor())
                .container(dto.getContainer())
                .labelText(dto.getLabelText())
                .quantity(dto.getQuantity() != null ? dto.getQuantity() : 1)
                .estimatedPrice(estimatedPrice)
                .notes(dto.getNotes())
                .status(Status.PENDING)
                .build();

        entity = customCandleRequestRepository.save(entity);
        return CustomCandleResponseDto.fromEntity(entity);
    }

    @Transactional(readOnly = true)
    public List<CustomCandleResponseDto> getUserRequests(User user) {
        return customCandleRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(CustomCandleResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CustomCandleResponseDto> getAllRequests() {
        return customCandleRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(CustomCandleResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomCandleResponseDto updateStatus(Long id, String status) {
        CustomCandleRequest entity = customCandleRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Custom candle request not found"));

        Status newStatus = Status.valueOf(status.toUpperCase());
        entity.setStatus(newStatus);
        entity = customCandleRequestRepository.save(entity);
        return CustomCandleResponseDto.fromEntity(entity);
    }

    private BigDecimal calculateEstimatedPrice(CustomCandleRequestDto dto) {
        // Base price by size: small=₹499, medium=₹799, large=₹1299
        int basePrice = switch (dto.getSize().toLowerCase()) {
            case "small" -> 499;
            case "medium" -> 799;
            case "large" -> 1299;
            default -> 499;
        };

        // Wax surcharge: soy=0, beeswax=+200, coconut=+150, paraffin=0
        int waxSurcharge = switch (dto.getWaxType().toLowerCase()) {
            case "beeswax" -> 200;
            case "coconut" -> 150;
            case "soy", "paraffin" -> 0;
            default -> 0;
        };

        // Container surcharge: jar=0, tin=+50, ceramic=+300, pillar=-50, votive=-100
        int containerSurcharge = switch (dto.getContainer().toLowerCase()) {
            case "tin" -> 50;
            case "ceramic" -> 300;
            case "pillar" -> -50;
            case "votive" -> -100;
            case "jar" -> 0;
            default -> 0;
        };

        // Scent surcharge: unscented=0, all others=+100
        int scentSurcharge = "unscented".equalsIgnoreCase(dto.getScent()) ? 0 : 100;

        // Label: +50 if labelText is provided
        int labelSurcharge = (dto.getLabelText() != null && !dto.getLabelText().isBlank()) ? 50 : 0;

        int unitPrice = basePrice + waxSurcharge + containerSurcharge + scentSurcharge + labelSurcharge;
        int quantity = dto.getQuantity() != null && dto.getQuantity() > 0 ? dto.getQuantity() : 1;
        int total = unitPrice * quantity;

        return BigDecimal.valueOf(total).setScale(2, RoundingMode.HALF_UP);
    }
}
