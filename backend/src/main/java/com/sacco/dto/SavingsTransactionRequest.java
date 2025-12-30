package com.sacco.dto;

import lombok.Data;

@Data
public class SavingsTransactionRequest {
    private Double amount;
    private String description;
    private String notes;
}
