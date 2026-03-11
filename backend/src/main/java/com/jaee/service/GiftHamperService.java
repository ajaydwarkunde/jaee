package com.jaee.service;

import com.jaee.dto.hamper.GiftHamperRequestDto;
import com.jaee.dto.hamper.GiftHamperResponseDto;
import com.jaee.entity.GiftHamperRequest;
import com.jaee.entity.GiftHamperRequest.Status;
import com.jaee.entity.User;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.GiftHamperRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.Map.entry;

@Service
@RequiredArgsConstructor
@Slf4j
public class GiftHamperService {

    private static final Map<String, Integer> ITEM_SURCHARGES = Map.ofEntries(
            entry("candle", 200),
            entry("diffuser", 350),
            entry("bath-salts", 150),
            entry("chocolates", 250),
            entry("dried-flowers", 200),
            entry("soap", 100),
            entry("tea", 150),
            entry("essential-oils", 300)
    );

    private final GiftHamperRequestRepository giftHamperRequestRepository;

    @Transactional
    public GiftHamperResponseDto createRequest(GiftHamperRequestDto dto, User user) {
        BigDecimal estimatedPrice = calculateEstimatedPrice(dto);

        GiftHamperRequest entity = GiftHamperRequest.builder()
                .user(user)
                .customerName(dto.getCustomerName())
                .customerEmail(dto.getCustomerEmail())
                .customerPhone(dto.getCustomerPhone())
                .hamperSize(dto.getHamperSize())
                .occasion(dto.getOccasion())
                .items(dto.getItems())
                .wrapping(dto.getWrapping())
                .messageCard(dto.getMessageCard())
                .recipientName(dto.getRecipientName())
                .colorTheme(dto.getColorTheme())
                .quantity(dto.getQuantity() != null ? dto.getQuantity() : 1)
                .estimatedPrice(estimatedPrice)
                .notes(dto.getNotes())
                .status(Status.PENDING)
                .build();

        entity = giftHamperRequestRepository.save(entity);
        return GiftHamperResponseDto.fromEntity(entity);
    }

    @Transactional(readOnly = true)
    public List<GiftHamperResponseDto> getUserRequests(User user) {
        return giftHamperRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(GiftHamperResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GiftHamperResponseDto> getAllRequests() {
        return giftHamperRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(GiftHamperResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public GiftHamperResponseDto updateStatus(Long id, String status) {
        GiftHamperRequest entity = giftHamperRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Gift hamper request not found"));

        Status newStatus = Status.valueOf(status.toUpperCase());
        entity.setStatus(newStatus);
        entity = giftHamperRequestRepository.save(entity);
        return GiftHamperResponseDto.fromEntity(entity);
    }

    private BigDecimal calculateEstimatedPrice(GiftHamperRequestDto dto) {
        // Base price by hamper size: small=₹999, medium=₹1999, large=₹2999, premium=₹4999
        int basePrice = switch (dto.getHamperSize().toLowerCase()) {
            case "small" -> 999;
            case "medium" -> 1999;
            case "large" -> 2999;
            case "premium" -> 4999;
            default -> 999;
        };

        // Item surcharges (per item in comma-separated list)
        int itemSurcharge = 0;
        if (dto.getItems() != null && !dto.getItems().isBlank()) {
            List<String> itemIds = Arrays.stream(dto.getItems().split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .toList();
            for (String itemId : itemIds) {
                itemSurcharge += ITEM_SURCHARGES.getOrDefault(itemId, 0);
            }
        }

        // Wrapping: classic=0, luxury=+200, eco-friendly=+100, festive=+150
        int wrappingSurcharge = switch (dto.getWrapping().toLowerCase()) {
            case "luxury" -> 200;
            case "eco-friendly" -> 100;
            case "festive" -> 150;
            case "classic" -> 0;
            default -> 0;
        };

        // Message card: +50 if provided
        int messageCardSurcharge = (dto.getMessageCard() != null && !dto.getMessageCard().isBlank()) ? 50 : 0;

        int unitPrice = basePrice + itemSurcharge + wrappingSurcharge + messageCardSurcharge;
        int quantity = dto.getQuantity() != null && dto.getQuantity() > 0 ? dto.getQuantity() : 1;
        int total = unitPrice * quantity;

        return BigDecimal.valueOf(total).setScale(2, RoundingMode.HALF_UP);
    }
}
