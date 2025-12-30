package com.sacco.repository;

import com.sacco.entity.PaymentAllocation;
import com.sacco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, UUID> {
    List<PaymentAllocation> findByUserOrderByCreatedAtDesc(User user);

    List<PaymentAllocation> findByAllocationType(String allocationType);
}
