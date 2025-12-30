package com.sacco.dto;

import lombok.Data;

@Data
public class LoanRequest {
    private Double amount;
    private Integer repaymentMonths;
}
