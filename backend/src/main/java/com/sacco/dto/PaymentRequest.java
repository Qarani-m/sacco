package com.sacco.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Double amount;
    private String phoneNumber;
    private String type; // registration, share, loan_repayment, savings
    private String category; // more specific if needed
    private String relatedId; // e.g., loanId if repayment
}
