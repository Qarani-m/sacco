package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "loan_guarantors")
@Getter
@Setter
public class LoanGuarantor extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guarantor_id", nullable = false)
    private User guarantor;

    // Number of shares pledged to cover this loan
    @Column(name = "shares_pledged", nullable = false)
    private Integer sharesPledged;

    // pending, accepted, rejected
    @Column(nullable = false)
    private String status = "pending";
}
