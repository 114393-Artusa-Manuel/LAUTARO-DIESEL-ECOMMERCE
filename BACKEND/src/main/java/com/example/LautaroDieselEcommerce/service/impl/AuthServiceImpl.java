package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.config.JwtTokenUtil;
import com.example.LautaroDieselEcommerce.dto.login.LoginRequest;
import com.example.LautaroDieselEcommerce.dto.login.LoginResponse;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import com.example.LautaroDieselEcommerce.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    public BaseResponse<LoginResponse> login(LoginRequest request) {
        System.out.println("📩 CORREO RECIBIDO: " + request.getCorreo());
        System.out.println("🔒 PASSWORD RECIBIDO: " + request.getPassword());
        UsuarioEntity usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getClaveHash())) {
            return new BaseResponse<>("Contraseña incorrecta", 400, null);
        }

        if (!usuario.getActivo()) {
            return new BaseResponse<>("Usuario inactivo", 400, null);
        }

        String token = jwtTokenUtil.generateToken(usuario);

        LoginResponse response = new LoginResponse(
                token,
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getCorreo(),
                usuario.getRoles() != null ? usuario.getRoles().toString() : "[]"
        );

        return new BaseResponse<>("Login exitoso", 200, response);
    }
}
