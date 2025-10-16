package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.usuario.*;
import com.example.LautaroDieselEcommerce.entity.usuario.RolEntity;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.usuario.RolRepository;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    private UsuarioEntity usuario;
    private RolEntity rol;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        rol = new RolEntity();
        rol.setId(1L);
        rol.setNombre("ADMIN");

        usuario = UsuarioEntity.builder()
                .id(1L)
                .correo("test@example.com")
                .nombreCompleto("Usuario Test")
                .telefono("123456789")
                .segmento("Minorista")
                .roles(List.of(rol))
                .activo(true)
                .build();
    }

    // ============================================================
    // ✅ CREAR USUARIO
    // ============================================================

    @Test
    void crearUsuario_CorreoExistente_DeberiaRetornar400() {
        UsuarioCreateDto dto = new UsuarioCreateDto();
        dto.setCorreo("test@example.com");

        when(usuarioRepository.existsByCorreo("test@example.com")).thenReturn(true);

        BaseResponse<UsuarioDto> response = usuarioService.crearUsuario(dto);

        assertEquals(400, response.getCodigo());
        assertEquals("El correo ya está registrado", response.getMensaje());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void crearUsuario_Exitoso_DeberiaRetornar201() {
        UsuarioCreateDto dto = new UsuarioCreateDto();
        dto.setCorreo("nuevo@example.com");
        dto.setClave("1234");
        dto.setNombreCompleto("Nuevo Usuario");
        dto.setTelefono("11111111");
        dto.setRolesIds(List.of(1L));

        when(usuarioRepository.existsByCorreo("nuevo@example.com")).thenReturn(false);
        when(rolRepository.findAllById(List.of(1L))).thenReturn(List.of(rol));
        when(passwordEncoder.encode("1234")).thenReturn("hashed");
        when(usuarioRepository.save(any())).thenReturn(usuario);

        BaseResponse<UsuarioDto> response = usuarioService.crearUsuario(dto);

        assertEquals(201, response.getCodigo());
        assertEquals("Usuario creado con éxito", response.getMensaje());
        assertNotNull(response.getData());
        verify(usuarioRepository, times(1)).save(any());
    }

    // ============================================================
    // ✅ ACTUALIZAR USUARIO
    // ============================================================

    @Test
    void actualizarUsuario_Existente_DeberiaActualizarYRetornar200() {
        UsuarioUpdateDto dto = new UsuarioUpdateDto();
        dto.setCorreo("nuevo@example.com");
        dto.setClave("1234");
        dto.setNombreCompleto("Actualizado");
        dto.setTelefono("22222222");
        dto.setSegmento("Mayorista");
        dto.setRolesIds(List.of(1L));

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findAllById(any())).thenReturn(List.of(rol));
        when(passwordEncoder.encode("1234")).thenReturn("hashed");
        when(usuarioRepository.save(any())).thenReturn(usuario);

        BaseResponse<UsuarioDto> response = usuarioService.actualizarUsuario(1L, dto);

        assertEquals(200, response.getCodigo());
        assertEquals("Usuario actualizado", response.getMensaje());
        verify(usuarioRepository, times(1)).save(any());
    }

    @Test
    void actualizarUsuario_SinClave_NoDebeReencodearPassword() {
        UsuarioUpdateDto dto = new UsuarioUpdateDto();
        dto.setCorreo("nuevo@example.com");
        dto.setClave(""); // sin contraseña
        dto.setNombreCompleto("Actualizado");
        dto.setTelefono("22222222");
        dto.setSegmento("Mayorista");
        dto.setRolesIds(List.of(1L));

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findAllById(any())).thenReturn(List.of(rol));
        when(usuarioRepository.save(any())).thenReturn(usuario);

        BaseResponse<UsuarioDto> response = usuarioService.actualizarUsuario(1L, dto);

        assertEquals(200, response.getCodigo());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void actualizarUsuario_NoExistente_DeberiaRetornar404() {
        UsuarioUpdateDto dto = new UsuarioUpdateDto();
        dto.setCorreo("test@example.com");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        BaseResponse<UsuarioDto> response = usuarioService.actualizarUsuario(1L, dto);

        assertEquals(404, response.getCodigo());
        assertEquals("Usuario no encontrado", response.getMensaje());
    }

    // ============================================================
    // ✅ ELIMINAR USUARIO
    // ============================================================

    @Test
    void eliminarUsuario_Existente_DeberiaEliminarYRetornar200() {
        when(usuarioRepository.existsById(1L)).thenReturn(true);
        doNothing().when(usuarioRepository).deleteById(1L);

        BaseResponse<String> response = usuarioService.eliminarUsuario(1L);

        assertEquals(200, response.getCodigo());
        assertEquals("Usuario eliminado", response.getMensaje());
        verify(usuarioRepository, times(1)).deleteById(1L);
    }

    @Test
    void eliminarUsuario_NoExistente_DeberiaRetornar404() {
        when(usuarioRepository.existsById(1L)).thenReturn(false);

        BaseResponse<String> response = usuarioService.eliminarUsuario(1L);

        assertEquals(404, response.getCodigo());
        assertEquals("Usuario no encontrado", response.getMensaje());
        verify(usuarioRepository, never()).deleteById(any());
    }

    // ============================================================
    // ✅ OBTENER USUARIO POR ID
    // ============================================================

    @Test
    void obtenerUsuarioPorId_Existente_DeberiaRetornarUsuario() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        BaseResponse<UsuarioDto> response = usuarioService.obtenerUsuarioPorId(1L);

        assertEquals(200, response.getCodigo());
        assertEquals("Usuario encontrado", response.getMensaje());
        assertEquals("Usuario Test", response.getData().getNombreCompleto());
    }

    @Test
    void obtenerUsuarioPorId_NoExistente_DeberiaRetornar404() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        BaseResponse<UsuarioDto> response = usuarioService.obtenerUsuarioPorId(1L);

        assertEquals(404, response.getCodigo());
        assertEquals("Usuario no encontrado", response.getMensaje());
    }

    // ============================================================
    // ✅ LISTAR USUARIOS
    // ============================================================

    @Test
    void listarUsuarios_DeberiaRetornarLista() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));

        BaseResponse<List<UsuarioDto>> response = usuarioService.listarUsuarios();

        assertEquals(200, response.getCodigo());
        assertEquals("Listado de usuarios", response.getMensaje());
        assertEquals(1, response.getData().size());
    }

    @Test
    void listarUsuarios_Vacio_DeberiaRetornarListaVacia() {
        when(usuarioRepository.findAll()).thenReturn(Collections.emptyList());

        BaseResponse<List<UsuarioDto>> response = usuarioService.listarUsuarios();

        assertEquals(0, response.getData().size());
        assertEquals("Listado de usuarios", response.getMensaje());
    }

    // ============================================================
    // ✅ mapToDTO (indirectamente cubierto, pero test explícito)
    // ============================================================

    @Test
    void mapToDTO_UsuarioSinRoles_DeberiaRetornarListaVacia() throws Exception {
        UsuarioEntity sinRoles = UsuarioEntity.builder()
                .id(2L)
                .correo("noRoles@example.com")
                .nombreCompleto("Sin Roles")
                .telefono("000")
                .activo(true)
                .roles(null)
                .build();

        var method = UsuarioServiceImpl.class.getDeclaredMethod("mapToDTO", UsuarioEntity.class);
        method.setAccessible(true);

        UsuarioDto dto = (UsuarioDto) method.invoke(usuarioService, sinRoles);

        assertNotNull(dto);
        assertNotNull(dto.getRoles());
        assertTrue(dto.getRoles().isEmpty());
    }
}
