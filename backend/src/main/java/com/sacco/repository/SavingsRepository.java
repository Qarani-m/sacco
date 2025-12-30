package com.sacco.repository;

import com.sacco.entity.Savings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavingsRepository extends JpaRepository<Savings, UUID> {

    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Savings s WHERE s.user.id = :userId")
    Double getTotalSavingsByUser(@Param("userId") UUID userId);

    List<Savings> findByUserIdOrderByTransactionDateDesc(UUID userId);
}
