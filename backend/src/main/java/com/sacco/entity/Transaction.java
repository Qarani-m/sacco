package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
public class Transaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Double amount;

    // 'credit', 'debit'
    @Column(nullable = false)
    private String type;

    // 'registration', 'share_purchase', 'loan_repayment', 'savings_deposit'
    @Column(nullable = false)
    private String category;

    @Column(unique = true)
    private String reference; // M-Pesa Receipt Number

    private String description;

    @Column(nullable = false)
    private String status = "pending"; // pending, completed, failed

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "external_id")
    private String externalId; // MerchantRequestID or similar
}
