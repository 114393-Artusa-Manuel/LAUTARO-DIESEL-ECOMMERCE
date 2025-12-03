package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.recuperar_clave.PasswordRecoveryRequest;
import com.example.LautaroDieselEcommerce.dto.recuperar_clave.ResetPasswordRequest;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.recuperar_clave.RecuperacionClaveEntity;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.recuperar_clave.RecuperacionClaveRepository;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import com.example.LautaroDieselEcommerce.service.PasswordRecoveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordRecoveryServiceImpl implements PasswordRecoveryService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RecuperacionClaveRepository recuperacionClaveRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.expiration-minutes:60}")
    private long expirationMinutes;

    @Value("${app.frontend.base-url:http://localhost:4200}")
    private String frontendBaseUrl;

    @Override
    @Transactional
    public BaseResponse<String> solicitarRecuperacion(PasswordRecoveryRequest request, String appBaseUrl) {
        Optional<UsuarioEntity> opt = usuarioRepository.findByCorreo(request.getCorreo());

        // No revelar si el correo existe o no
        if (opt.isEmpty()) {
            return new BaseResponse<>("Si el correo existe, se enviará un enlace de recuperación", 200, null);
        }

        UsuarioEntity usuario = opt.get();

        // Eliminar solicitudes anteriores de recuperación
        recuperacionClaveRepository.deleteByUsuario(usuario);

        // Crear nueva solicitud
        String token = UUID.randomUUID().toString();
        LocalDateTime expira = LocalDateTime.now().plusMinutes(expirationMinutes);

        RecuperacionClaveEntity rc = new RecuperacionClaveEntity();
        rc.setUsuario(usuario);
        rc.setToken(token);
        rc.setExpiraEn(expira);
        rc.setFechaCreacion(LocalDateTime.now());
        rc.setUsado(false);
        recuperacionClaveRepository.save(rc);

        // Construir enlace de recuperación
        String resetUrl = appBaseUrl + "/reset-password/" + token;

        // Enviar correo con Gmail API
        enviarCorreoRecuperacion(usuario.getCorreo(), resetUrl);

        return new BaseResponse<>("Si el correo existe, se enviará un enlace de recuperación", 200, null);
    }

    @Override
    @Transactional
    public BaseResponse<String> resetearPassword(ResetPasswordRequest request) {
        RecuperacionClaveEntity rc = recuperacionClaveRepository
                .findByTokenAndUsadoFalseAndExpiraEnAfter(request.getToken(), LocalDateTime.now())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido o expirado"));

        UsuarioEntity usuario = rc.getUsuario();
        usuario.setClaveHash(passwordEncoder.encode(request.getNewPassword()));
        usuario.setFechaActualizacion(LocalDateTime.now());

        usuarioRepository.save(usuario);

        rc.setUsado(true);
        recuperacionClaveRepository.save(rc);

        return new BaseResponse<>("Contraseña actualizada correctamente", 200, null);
    }

    // Envía el correo de recuperación utilizando la API de Gmail (OAuth2)
    private void enviarCorreoRecuperacion(String destinatario, String enlace) {
        try {
            GmailServiceImpl gmailService = new GmailServiceImpl();
            String asunto = "Recuperación de contraseña - Lautaro Diesel Ecommerce";

            // 💡 Cuerpo simple en HTML
            String cuerpo = "<p>Hola,</p>"
                    + "<p>Hacé clic <a href='" + enlace + "'>acá</a> para restablecer tu contraseña.</p>"
                    + "<p>Este enlace expira en " + expirationMinutes + " minutos.</p>"
                    + "<p>Si no solicitaste un cambio de contraseña, ignorá este correo.</p>";

            gmailService.sendEmail(destinatario, asunto, cuerpo);
            System.out.println("📧 Correo enviado correctamente a " + destinatario);

        } catch (Exception e) {
            System.err.println("❌ Error al enviar el correo: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo enviar el correo de recuperación");
        }
    }

}
