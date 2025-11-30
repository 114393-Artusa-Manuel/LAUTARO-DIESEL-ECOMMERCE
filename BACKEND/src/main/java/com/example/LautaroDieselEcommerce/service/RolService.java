package com.example.LautaroDieselEcommerce.service;

import java.util.List;

import com.example.LautaroDieselEcommerce.entity.usuario.RolEntity;

public interface RolService {

    void crearRol(RolEntity rol);
    RolEntity obtenerRolPorId(Long id);
    List<RolEntity> obtenerTodosLosRoles();
    void actualizarRol(Long id, RolEntity rol);
    void eliminarRol(Long id);
} 


