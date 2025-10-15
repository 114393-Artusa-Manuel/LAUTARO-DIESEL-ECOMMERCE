package com.example.LautaroDieselEcommerce.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.example.LautaroDieselEcommerce.entity.usuario.RolEntity;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.usuario.RolRepository;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import com.example.LautaroDieselEcommerce.service.UsuarioRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioRoleServiceImpl implements UsuarioRoleService {

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private RolRepository rolRepo;

    @Override
    public void addRole(Long usuarioId, Long roleId) {
         UsuarioEntity usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        RolEntity rol = rolRepo.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        // Ensure roles list is initialized to avoid NPE
        if (usuario.getRoles() == null) {
            usuario.setRoles(new ArrayList<>());
        }

        if (usuario.getRoles().stream().noneMatch(r -> Objects.equals(r.getId(), roleId))) {
            usuario.getRoles().add(rol);
            usuario.setFechaActualizacion(LocalDateTime.now());
            usuarioRepo.save(usuario);
        }

    }


    


    @Override
    public void addRole(Long usuarioId, List<Long> roleIds) {
        
    }


    @Override
    public void removeRole(Long usuarioId, List<Long> roleIds) {
        UsuarioEntity usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        RolEntity rol = rolRepo.findById(roleIds.get(0))
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        // Ensure roles list is initialized to avoid NPE
        if (usuario.getRoles() == null) {
            usuario.setRoles(new ArrayList<>());
        }

        if (usuario.getRoles().stream().anyMatch(r -> Objects.equals(r.getId(), roleIds.get(0)))) {
            usuario.getRoles().removeIf(r -> Objects.equals(r.getId(), roleIds.get(0)));
            usuario.setFechaActualizacion(LocalDateTime.now());
            usuarioRepo.save(usuario);
        }
    }


    @Override
    public void setRoles(Long idUsuario, List<Long> roleIds) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setRoles'");
    }


    @Override
    public Object getRoles(Long idUsuario) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getRoles'");
    }
}