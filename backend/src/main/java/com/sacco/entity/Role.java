package com.sacco.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    @Column(name = "is_active")
    private boolean isActive = true;

    @jakarta.persistence.ManyToMany(fetch = jakarta.persistence.FetchType.EAGER)
    @jakarta.persistence.JoinTable(name = "role_permissions", joinColumns = @jakarta.persistence.JoinColumn(name = "role_id"), inverseJoinColumns = @jakarta.persistence.JoinColumn(name = "permission_id"))
    private java.util.Set<Permission> permissions = new java.util.HashSet<>();
}
