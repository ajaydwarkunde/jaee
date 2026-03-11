package com.jaee.service;

import com.jaee.dto.builder.BuilderOptionDto;
import com.jaee.entity.BuilderOption;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.BuilderOptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BuilderOptionService {

    private final BuilderOptionRepository builderOptionRepository;

    @Transactional(readOnly = true)
    public List<BuilderOptionDto> getActiveOptions(String builderType, String optionType) {
        List<BuilderOption> options;
        if (optionType != null && !optionType.isBlank()) {
            options = builderOptionRepository.findByBuilderTypeAndOptionTypeAndActiveTrueOrderByDisplayOrderAsc(builderType, optionType);
        } else {
            options = builderOptionRepository.findByBuilderTypeOrderByOptionTypeAscDisplayOrderAsc(builderType)
                    .stream()
                    .filter(BuilderOption::getActive)
                    .toList();
        }
        return options.stream().map(BuilderOptionDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, List<BuilderOptionDto>> getAllOptionsByBuilder(String builderType) {
        List<BuilderOption> options = builderOptionRepository.findByBuilderTypeOrderByOptionTypeAscDisplayOrderAsc(builderType);
        return options.stream()
                .map(BuilderOptionDto::fromEntity)
                .collect(Collectors.groupingBy(BuilderOptionDto::getOptionType));
    }

    @Transactional(readOnly = true)
    public List<BuilderOptionDto> getAllOptionsByBuilderAndType(String builderType, String optionType) {
        return builderOptionRepository.findByBuilderTypeAndOptionTypeOrderByDisplayOrderAsc(builderType, optionType)
                .stream()
                .map(BuilderOptionDto::fromEntity)
                .toList();
    }

    @Transactional
    public BuilderOptionDto createOption(BuilderOptionDto dto) {
        builderOptionRepository.findByBuilderTypeAndOptionTypeAndOptionKey(
                        dto.getBuilderType(), dto.getOptionType(), dto.getOptionKey())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Option already exists: " + dto.getBuilderType() + "/" + dto.getOptionType() + "/" + dto.getOptionKey());
                });

        BuilderOption entity = BuilderOption.builder()
                .builderType(dto.getBuilderType())
                .optionType(dto.getOptionType())
                .optionKey(dto.getOptionKey())
                .label(dto.getLabel())
                .description(dto.getDescription())
                .emoji(dto.getEmoji())
                .hexColor(dto.getHexColor())
                .colorsJson(dto.getColorsJson())
                .basePrice(dto.getBasePrice() != null ? dto.getBasePrice() : java.math.BigDecimal.ZERO)
                .surcharge(dto.getSurcharge() != null ? dto.getSurcharge() : java.math.BigDecimal.ZERO)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .build();

        entity = builderOptionRepository.save(entity);
        return BuilderOptionDto.fromEntity(entity);
    }

    @Transactional
    public BuilderOptionDto updateOption(Long id, BuilderOptionDto dto) {
        BuilderOption entity = builderOptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Builder option not found"));

        if (dto.getLabel() != null) entity.setLabel(dto.getLabel());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getEmoji() != null) entity.setEmoji(dto.getEmoji());
        if (dto.getHexColor() != null) entity.setHexColor(dto.getHexColor());
        if (dto.getColorsJson() != null) entity.setColorsJson(dto.getColorsJson());
        if (dto.getBasePrice() != null) entity.setBasePrice(dto.getBasePrice());
        if (dto.getSurcharge() != null) entity.setSurcharge(dto.getSurcharge());
        if (dto.getActive() != null) entity.setActive(dto.getActive());
        if (dto.getDisplayOrder() != null) entity.setDisplayOrder(dto.getDisplayOrder());

        entity = builderOptionRepository.save(entity);
        return BuilderOptionDto.fromEntity(entity);
    }

    @Transactional
    public BuilderOptionDto toggleActive(Long id) {
        BuilderOption entity = builderOptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Builder option not found"));
        entity.setActive(!Boolean.TRUE.equals(entity.getActive()));
        entity = builderOptionRepository.save(entity);
        return BuilderOptionDto.fromEntity(entity);
    }

    @Transactional
    public void deleteOption(Long id) {
        BuilderOption entity = builderOptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Builder option not found"));
        builderOptionRepository.delete(entity);
    }
}
