package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "welfare_claims")
@Getter
@Setter
public class WelfareClaim extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "claim_type", nullable = false)
    private String claimType; // e.g., "Medical", "Bereavement", "Education"

    @Column(nullable = false)
    private Double amount;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "pending"; // pending, approved, rejected, paid

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "documents_url")
    private String documentsUrl;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;
}
