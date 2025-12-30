package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "generated_reports")
@Getter
@Setter
public class Report extends BaseEntity {

    @Column(name = "report_type", nullable = false)
    private String reportType; // LOAN_PORTFOLIO, MEMBER_STATS, FINANCIAL, etc.

    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters; // JSON string of params

    @Column(name = "format")
    private String format; // PDF, CSV, EXCEL

    @Column(name = "file_url")
    private String fileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by")
    private User generatedBy;

    @Column(name = "status")
    private String status; // PENDING, COMPLETED, FAILED
}
