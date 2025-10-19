package com.example.LautaroDieselEcommerce.dto.usuario_roles;

import java.util.List;

public class RoleAssignRequest {
    private Long usuarioId;
    // legacy single roleId
    private Long roleId;
    // new: allow multiple role ids
    private List<Long> roleIds;

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public List<Long> getRoleIds() {
        return roleIds;
    }

    public void setRoleIds(List<Long> roleIds) {
        this.roleIds = roleIds;
    }
}
