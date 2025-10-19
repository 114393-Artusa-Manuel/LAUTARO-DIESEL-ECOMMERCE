package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioCreateDto;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioDto;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioUpdateDto;
import com.example.LautaroDieselEcommerce.entity.usuario.RolEntity;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.usuario.RolRepository;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import com.example.LautaroDieselEcommerce.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public BaseResponse<UsuarioDto> crearUsuario(UsuarioCreateDto dto) {
        if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
            return new BaseResponse<>("El correo ya está registrado", 400, null);
        }
    // Ignorar cualquier rolesIds enviado por el cliente y asignar siempre el rol 'particular'
    RolEntity rolParticular = rolRepository.findByNombreIgnoreCase("particular")
        .orElseGet(() -> {
            RolEntity nuevo = RolEntity.builder()
                .nombre("particular")
                .build();
            return rolRepository.save(nuevo);
        });
    List<RolEntity> roles = new ArrayList<>();
    roles.add(rolParticular);
        UsuarioEntity usuario = UsuarioEntity.builder()
                .correo(dto.getCorreo())
                .claveHash(passwordEncoder.encode(dto.getClave()))
                .nombreCompleto(dto.getNombreCompleto())
                .telefono(dto.getTelefono())
                .activo(true)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .roles(roles)
                .build();

        usuarioRepository.save(usuario);

        return new BaseResponse<>("Usuario creado con éxito", 201, mapToDTO(usuario));
    }

    @Override
    public BaseResponse<UsuarioDto> actualizarUsuario(Long id, UsuarioUpdateDto dto) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setCorreo(dto.getCorreo());
                    if (dto.getClave() != null && !dto.getClave().isEmpty()) {
                        usuario.setClaveHash(passwordEncoder.encode(dto.getClave()));
                    }
                    usuario.setNombreCompleto(dto.getNombreCompleto());
                    usuario.setTelefono(dto.getTelefono());
                    usuario.setSegmento(dto.getSegmento());
                    usuario.setFechaActualizacion(LocalDateTime.now());

                    if (dto.getRolesIds() != null) {
                        List<RolEntity> roles = rolRepository.findAllById(dto.getRolesIds());
                        usuario.setRoles(roles);
                    }

                    usuarioRepository.save(usuario);
                    return new BaseResponse<>("Usuario actualizado", 200, mapToDTO(usuario));
                })
                .orElseGet(() -> new BaseResponse<>("Usuario no encontrado", 404, null));
    }

    @Override
    public BaseResponse<String> eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            return new BaseResponse<>("Usuario no encontrado", 404, null);
        }
        usuarioRepository.deleteById(id);
        return new BaseResponse<>("Usuario eliminado", 200, null);
    }

    @Override
    public BaseResponse<UsuarioDto> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> new BaseResponse<>("Usuario encontrado", 200, mapToDTO(usuario)))
                .orElseGet(() -> new BaseResponse<>("Usuario no encontrado", 404, null));
    }

    @Override
    public BaseResponse<List<UsuarioDto>> listarUsuarios() {
        List<UsuarioDto> usuarios = usuarioRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new BaseResponse<>("Listado de usuarios", 200, usuarios);
    }

    private UsuarioDto mapToDTO(UsuarioEntity usuario) {
        return UsuarioDto.builder()
                .id(usuario.getId())
                .correo(usuario.getCorreo())
                .nombreCompleto(usuario.getNombreCompleto())
                .telefono(usuario.getTelefono())
                .segmento(usuario.getSegmento())
                .activo(usuario.getActivo())
                .roles(usuario.getRoles() != null
                        ? usuario.getRoles().stream()
                        .map(RolEntity::getNombre)
                        .toList()  // convertimos a List
                        : new ArrayList<>()) // lista vacía si es null
                .build();
    }

}


