package com.sacco.repository;

import com.sacco.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShareRepository extends JpaRepository<Share, UUID> {

    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM Share s WHERE s.user.id = :userId")
    Integer getTotalSharesByUser(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM Share s WHERE s.user.id = :userId AND s.status = 'active'")
    Integer getActiveSharesByUser(@Param("userId") UUID userId);

    List<Share> findByUserIdOrderByPurchaseDateDesc(UUID userId);

    // For pledging logic, we need to find active shares to update them
    List<Share> findByUserIdAndStatusOrderByPurchaseDateAsc(UUID userId, String status);
}
