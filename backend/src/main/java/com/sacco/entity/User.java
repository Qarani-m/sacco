package com.sacco.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password; // Mapped to password_hash

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone_number")
    private String phoneNumber;

    // Legacy string role support might be needed, but we prefer relation
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    // Additional fields from schema analysis
    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "registration_paid")
    private boolean registrationPaid = false;

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "verification_token_expires")
    private LocalDateTime verificationTokenExpires;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expires")
    private LocalDateTime resetPasswordTokenExpires;

    @Column(name = "can_be_guarantor")
    private boolean canBeGuarantor = false;

    @Column(name = "max_shares_to_guarantee")
    private Double maxSharesToGuarantee = 0.0;
}
