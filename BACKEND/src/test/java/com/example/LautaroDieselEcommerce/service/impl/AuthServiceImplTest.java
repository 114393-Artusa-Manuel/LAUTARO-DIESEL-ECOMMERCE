package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.config.JwtTokenUtil;
import com.example.LautaroDieselEcommerce.dto.login.LoginRequest;
import com.example.LautaroDieselEcommerce.dto.login.LoginResponse;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private UsuarioEntity usuario;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        usuario = new UsuarioEntity();
        usuario.setId(1L);
        usuario.setCorreo("test@example.com");
        usuario.setClaveHash("encodedPass");
        usuario.setActivo(true);
        usuario.setNombreCompleto("Usuario Test");
        usuario.setRoles(Collections.emptyList());
    }

    @Test
    void login_Exitoso_DeberiaRetornarBaseResponseConToken() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("test@example.com");
        request.setPassword("1234");

        when(usuarioRepository.findByCorreo("test@example.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("1234", "encodedPass")).thenReturn(true);
        when(jwtTokenUtil.generateToken(usuario)).thenReturn("jwt-token");

        BaseResponse<LoginResponse> response = authService.login(request);

        assertNotNull(response);
        assertEquals(200, response.getCodigo());
        assertEquals("Login exitoso", response.getMensaje());
        assertEquals("jwt-token", response.getData().getToken());
        assertEquals("Usuario Test", response.getData().getNombre());
        verify(usuarioRepository, times(1)).findByCorreo("test@example.com");
    }

    @Test
    void login_UsuarioNoEncontrado_DeberiaLanzarNotFound() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("noexiste@example.com");
        request.setPassword("1234");

        when(usuarioRepository.findByCorreo("noexiste@example.com")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Usuario no encontrado"));
        verify(usuarioRepository, times(1)).findByCorreo("noexiste@example.com");
    }

    @Test
    void login_PasswordIncorrecta_DeberiaLanzarUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("test@example.com");
        request.setPassword("wrongpass");

        when(usuarioRepository.findByCorreo("test@example.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("wrongpass", "encodedPass")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Contraseña incorrecta"));
    }

    @Test
    void login_UsuarioInactivo_DeberiaLanzarBadRequest() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("test@example.com");
        request.setPassword("1234");

        usuario.setActivo(false);

        when(usuarioRepository.findByCorreo("test@example.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("1234", "encodedPass")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Usuario inactivo"));
    }
}
