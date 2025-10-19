package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.entity.usuario.RolEntity;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.usuario.RolRepository;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioRoleServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @InjectMocks
    private UsuarioRoleServiceImpl usuarioRoleService;

    private UsuarioEntity usuario;
    private RolEntity rol;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        rol = new RolEntity();
        rol.setId(1L);
        rol.setNombre("ADMIN");

        usuario = new UsuarioEntity();
        usuario.setId(10L);
        usuario.setNombreCompleto("Usuario Test");
        usuario.setRoles(new ArrayList<>());
    }

    @Test
    void addRole_Exitoso_DeberiaAgregarYGuardarUsuario() {
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

        usuarioRoleService.addRole(10L, 1L);

        assertEquals(1, usuario.getRoles().size());
        assertEquals("ADMIN", usuario.getRoles().get(0).getNombre());
        verify(usuarioRepository, times(1)).save(usuario);
    }

    @Test
    void addRole_UsuarioNoEncontrado_DeberiaLanzarExcepcion() {
        when(usuarioRepository.findById(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                usuarioRoleService.addRole(10L, 1L)
        );
        assertEquals("Usuario no encontrado", ex.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void addRole_RolNoEncontrado_DeberiaLanzarExcepcion() {
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                usuarioRoleService.addRole(10L, 1L)
        );
        assertEquals("Rol no encontrado", ex.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void addRole_UsuarioConListaRolesNull_DeberiaInicializarla() {
        usuario.setRoles(null);
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

        usuarioRoleService.addRole(10L, 1L);

        assertNotNull(usuario.getRoles());
        assertEquals(1, usuario.getRoles().size());
        verify(usuarioRepository, times(1)).save(usuario);
    }

    @Test
    void addRole_RolYaExistente_NoDebeDuplicarNiGuardar() {
        usuario.setRoles(new ArrayList<>(List.of(rol)));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

        usuarioRoleService.addRole(10L, 1L);

        assertEquals(1, usuario.getRoles().size());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void removeRole_Exitoso_DeberiaEliminarRolYGuardarUsuario() {
        usuario.setRoles(new ArrayList<>(List.of(rol)));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

        usuarioRoleService.removeRole(10L, 1L);

        assertTrue(usuario.getRoles().isEmpty());
        verify(usuarioRepository, times(1)).save(usuario);
    }

    @Test
    void removeRole_UsuarioNoEncontrado_DeberiaLanzarExcepcion() {
        when(usuarioRepository.findById(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                usuarioRoleService.removeRole(10L, 1L)
        );
        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void removeRole_RolNoEncontrado_DeberiaLanzarExcepcion() {
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                usuarioRoleService.removeRole(10L, 1L)
        );
        assertEquals("Rol no encontrado", ex.getMessage());
    }

    @Test
    void removeRole_UsuarioConListaRolesNull_DeberiaInicializarlaSinFallar() {
        usuario.setRoles(null);
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

        usuarioRoleService.removeRole(10L, 1L);

        assertNotNull(usuario.getRoles());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void removeRole_RolNoPresente_NoDebeGuardar() {
        usuario.setRoles(new ArrayList<>()); // sin el rol
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

        usuarioRoleService.removeRole(10L, 1L);

        assertTrue(usuario.getRoles().isEmpty());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void addRole_DebeActualizarFechaActualizacion() {
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

        usuarioRoleService.addRole(10L, 1L);

        assertNotNull(usuario.getFechaActualizacion());
        assertTrue(usuario.getFechaActualizacion().isBefore(LocalDateTime.now().plusSeconds(2)));
    }

    @Test
    void removeRole_DebeActualizarFechaActualizacion() {
        usuario.setRoles(new ArrayList<>(List.of(rol)));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

        usuarioRoleService.removeRole(10L, 1L);

        assertNotNull(usuario.getFechaActualizacion());
        assertTrue(usuario.getFechaActualizacion().isBefore(LocalDateTime.now().plusSeconds(2)));
    }
}
