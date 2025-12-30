package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pending_actions")
@Getter
@Setter
public class PendingAction extends BaseEntity {

    @Column(name = "action_type", nullable = false)
    private String actionType; // "APPROVE_LOAN", "APPROVE_MEMBER", "DISBURSE_LOAN", etc.

    @Column(name = "entity_type", nullable = false)
    private String entityType; // "loan", "user", "document"

    @Column(name = "entity_id", nullable = false)
    private String entityId;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by", nullable = false)
    private User initiatedBy;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ActionStatus status = ActionStatus.PENDING;

    @Column(name = "required_approvals")
    private int requiredApprovals = 2; // Default 2/3 approval

    @Column(name = "approval_count")
    private int approvalCount = 0;

    @Column(name = "rejection_count")
    private int rejectionCount = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "pendingAction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActionVerification> verifications = new ArrayList<>();

    public enum ActionStatus {
        PENDING,
        APPROVED,
        REJECTED,
        EXPIRED
    }
}
