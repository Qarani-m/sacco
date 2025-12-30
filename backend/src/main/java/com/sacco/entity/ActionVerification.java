package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "action_verifications")
@Getter
@Setter
public class ActionVerification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pending_action_id", nullable = false)
    private PendingAction pendingAction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verifier_id", nullable = false)
    private User verifier;

    @Column(name = "decision", nullable = false)
    @Enumerated(EnumType.STRING)
    private Decision decision;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    public enum Decision {
        APPROVED,
        REJECTED
    }
}
