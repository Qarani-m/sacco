package com.sacco.repository;

import com.sacco.entity.WelfarePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WelfarePaymentRepository extends JpaRepository<WelfarePayment, UUID> {
    List<WelfarePayment> findByUserIdOrderByPaymentDateDesc(UUID userId);
}
