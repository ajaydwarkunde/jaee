package com.jaee.repository;

import com.jaee.entity.BuilderOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuilderOptionRepository extends JpaRepository<BuilderOption, Long> {

    List<BuilderOption> findByBuilderTypeAndOptionTypeAndActiveTrueOrderByDisplayOrderAsc(String builderType, String optionType);

    List<BuilderOption> findByBuilderTypeOrderByOptionTypeAscDisplayOrderAsc(String builderType);

    List<BuilderOption> findByBuilderTypeAndOptionTypeOrderByDisplayOrderAsc(String builderType, String optionType);

    Optional<BuilderOption> findByBuilderTypeAndOptionTypeAndOptionKey(String builderType, String optionType, String optionKey);
}
