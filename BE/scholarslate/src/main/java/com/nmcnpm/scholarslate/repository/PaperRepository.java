package com.nmcnpm.scholarslate.repository;

import com.nmcnpm.scholarslate.entity.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long>, PaperRepositoryCustom {



}
