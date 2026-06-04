package com.nmcnpm.scholarslate.mapper;

import com.nmcnpm.scholarslate.dto.PaperDto;
import com.nmcnpm.scholarslate.entity.Paper;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {TopicMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaperMapper {
    PaperDto toDto(Paper paper);
    Paper toEntity(PaperDto dto);
}
