package com.example.LautaroDieselEcommerce.service;

import java.util.List;

public interface UsuarioRoleService {

    void addRole(Long usuarioId, Long roleId);
    void removeRole(Long usuarioId, List<Long> roleIds);
    Object getRoles(Long idUsuario);
    void setRoles(Long idUsuario, List<Long> roleIds);
} 

