package com.sacco.repository;

import com.sacco.entity.WelfareClaim;
import com.sacco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WelfareClaimRepository extends JpaRepository<WelfareClaim, UUID> {
    List<WelfareClaim> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
