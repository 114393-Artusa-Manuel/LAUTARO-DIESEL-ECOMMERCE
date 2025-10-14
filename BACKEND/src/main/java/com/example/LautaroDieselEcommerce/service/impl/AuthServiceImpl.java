package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.config.JwtTokenUtil;
import com.example.LautaroDieselEcommerce.dto.login.LoginRequest;
import com.example.LautaroDieselEcommerce.dto.login.LoginResponse;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import com.example.LautaroDieselEcommerce.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));


        if (!passwordEncoder.matches(request.getPassword(), usuario.getClaveHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
        }

        if (!usuario.getActivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario inactivo");
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
