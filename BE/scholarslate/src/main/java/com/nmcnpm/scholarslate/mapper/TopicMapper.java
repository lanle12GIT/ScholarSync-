package com.nmcnpm.scholarslate.mapper;

import com.nmcnpm.scholarslate.dto.TopicDto;
import com.nmcnpm.scholarslate.entity.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TopicMapper {
    TopicDto toDto(Topic topic);
    Topic toEntity(TopicDto dto);
}
