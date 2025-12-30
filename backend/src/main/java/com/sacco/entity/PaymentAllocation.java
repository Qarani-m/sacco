package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_allocations")
@Getter
@Setter
public class PaymentAllocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @Column(name = "allocation_type", nullable = false)
    private String allocationType; // LOAN, SAVINGS, SHARES, WELFARE

    @Column(name = "target_id")
    private String targetId; // Loan ID or Share ID etc.

    @Column(nullable = false)
    private Double amount;

    @Column(name = "status")
    private String status = "completed"; // completed, reversed

    @Column(name = "notes")
    private String notes;
}
