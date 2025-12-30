package com.sacco.service;

import com.sacco.entity.Permission;
import com.sacco.entity.Role;
import com.sacco.repository.PermissionRepository;
import com.sacco.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    @Transactional
    public Role createRole(Role role) {
        if (roleRepository.findByName(role.getName()).isPresent()) {
            throw new RuntimeException("Role name already exists");
        }
        return roleRepository.save(role);
    }

    @Transactional
    public Role updateRole(UUID id, Role updates) {
        Role role = getRoleById(id);
        if (updates.getName() != null)
            role.setName(updates.getName());
        if (updates.getDescription() != null)
            role.setDescription(updates.getDescription());
        return roleRepository.save(role);
    }

    @Transactional
    public void deleteRole(UUID id) {
        roleRepository.deleteById(id);
    }

    public Set<Permission> getRolePermissions(UUID roleId) {
        Role role = getRoleById(roleId);
        return role.getPermissions();
    }

    @Transactional
    public Role updateRolePermissions(UUID roleId, List<UUID> permissionIds) {
        Role role = getRoleById(roleId);
        List<Permission> permissions = permissionRepository.findAllById(permissionIds);
        role.setPermissions(new HashSet<>(permissions));
        return roleRepository.save(role);
    }

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }
}
