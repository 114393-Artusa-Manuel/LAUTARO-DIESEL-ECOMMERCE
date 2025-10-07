package com.example.LautaroDieselEcommerce.dto.usuario_roles;

public class RoleAssignRequest {
    private Long usuarioId;
    private Long roleId;

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
}
