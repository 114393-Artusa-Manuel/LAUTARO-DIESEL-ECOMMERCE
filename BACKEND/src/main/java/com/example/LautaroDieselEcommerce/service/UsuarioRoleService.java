package com.example.LautaroDieselEcommerce.service;

public interface UsuarioRoleService {

    void addRole(Long usuarioId, Long roleId);
    void removeRole(Long usuarioId, Long roleId);
} 

