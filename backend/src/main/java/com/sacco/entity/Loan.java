package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Getter
@Setter
public class Loan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @Column(name = "requested_amount", nullable = false)
    private Double requestedAmount;

    @Column(name = "repayment_months", nullable = false)
    private Integer repaymentMonths;

    @Column(name = "interest_rate")
    private Double interestRate; // e.g. 5.0 for 5%

    // 'pending', 'approved', 'active', 'rejected', 'paid'
    @Column(name = "status")
    private String status = "pending";

    @Column(name = "approved_amount")
    private Double approvedAmount;

    @Column(name = "balance_remaining")
    private Double balanceRemaining;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "disbursed_at")
    private LocalDateTime disbursedAt;

    // Workflow fields
    @Column(name = "workflow_id")
    private String workflowId; // Could be relation to Workflow entity if creating one

    @Column(name = "current_step_id")
    private String currentStepId;
}
