package com.nmcnpm.scholarslate.mapper;

import com.nmcnpm.scholarslate.dto.UserDto;
import com.nmcnpm.scholarslate.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(UserDto dto);
}
