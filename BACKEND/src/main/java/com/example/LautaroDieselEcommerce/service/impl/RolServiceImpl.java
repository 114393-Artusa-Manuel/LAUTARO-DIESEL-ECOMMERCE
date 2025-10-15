package com.example.LautaroDieselEcommerce.service.impl;

import java.util.List;

import com.example.LautaroDieselEcommerce.entity.usuario.RolEntity;
import com.example.LautaroDieselEcommerce.repository.usuario.RolRepository;
import com.example.LautaroDieselEcommerce.service.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RolServiceImpl implements RolService {

    @Autowired
    private RolRepository rolRepository;

    @Override
    public void crearRol(RolEntity rol) {
        // evitar duplicados por nombre
        rolRepository.findByNombre(rol.getNombre())
                .ifPresent(r -> { throw new RuntimeException("El rol ya existe"); });
        rolRepository.save(rol);
    }

    @Override
    public RolEntity obtenerRolPorId(Long id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
    }

    @Override
    public List<RolEntity> obtenerTodosLosRoles() {
        return rolRepository.findAll();
    }

    @Override
    public void actualizarRol(Long id, RolEntity rol) {
        RolEntity existente = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        existente.setNombre(rol.getNombre());
        rolRepository.save(existente);
    }

    @Override
    public void eliminarRol(Long id) {
        if (!rolRepository.existsById(id)) {
            throw new RuntimeException("Rol no encontrado");
        }
        rolRepository.deleteById(id);
    }

}
