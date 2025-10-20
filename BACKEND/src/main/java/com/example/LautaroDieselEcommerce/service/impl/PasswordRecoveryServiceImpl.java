package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.recuperar_clave.PasswordRecoveryRequest;
import com.example.LautaroDieselEcommerce.dto.recuperar_clave.ResetPasswordRequest;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.recuperar_clave.RecuperacionClaveEntity;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import com.example.LautaroDieselEcommerce.repository.recuperar_clave.RecuperacionClaveRepository;
import com.example.LautaroDieselEcommerce.repository.usuario.UsuarioRepository;
import com.example.LautaroDieselEcommerce.service.PasswordRecoveryService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.password-reset.expiration-minutes:60}")
    private long expirationMinutes;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public PasswordRecoveryServiceImpl(UsuarioRepository usuarioRepository,
                                       RecuperacionClaveRepository recuperacionClaveRepository,
                                       PasswordEncoder passwordEncoder,
                                       JavaMailSender mailSender) {
        this.usuarioRepository = usuarioRepository;
        this.recuperacionClaveRepository = recuperacionClaveRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Override
    @Transactional
    public BaseResponse<String> solicitarRecuperacion(PasswordRecoveryRequest request, String appBaseUrl) {
        Optional<UsuarioEntity> opt = usuarioRepository.findByCorreo(request.getCorreo());

        if (opt.isEmpty()) {
            // No revelar si el correo existe o no por seguridad
            return new BaseResponse<>("Si el correo existe, se enviará un enlace de recuperación", 200, null);
        }

        UsuarioEntity usuario = opt.get();

        // Eliminar solicitudes anteriores del mismo usuario
        recuperacionClaveRepository.deleteByUsuario(usuario);

        // Generar token y fecha de expiración
        String token = UUID.randomUUID().toString();
        LocalDateTime expira = LocalDateTime.now().plusMinutes(expirationMinutes);

        // Crear la nueva solicitud
        RecuperacionClaveEntity rc = new RecuperacionClaveEntity();
        rc.setUsuario(usuario);
        rc.setToken(token);
        rc.setExpiraEn(LocalDateTime.now().plusMinutes(15));
        rc.setFechaCreacion(LocalDateTime.now());
        rc.setUsado(false);

        recuperacionClaveRepository.save(rc);

        // Construir URL de reseteo
        String resetUrl = appBaseUrl + "/reset-password?token=" + token;

        // Enviar el correo
        enviarCorreoRecuperacion(usuario.getCorreo(), resetUrl);

        return new BaseResponse<>("Si el correo existe, se enviará un enlace de recuperación", 200, null);
    }

    @Override
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

    private void enviarCorreoRecuperacion(String destinatario, String enlace) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(senderEmail);
            mail.setTo(destinatario);
            mail.setSubject("Recuperación de contraseña - Lautaro Diesel Ecommerce");
            mail.setText("Hola!\n\nPara restablecer tu contraseña hacé clic en el siguiente enlace:\n\n"
                    + enlace + "\n\nEste enlace expira en " + expirationMinutes + " minutos.\n\n"
                    + "Si no solicitaste un cambio de contraseña, ignorá este correo.");

            mailSender.send(mail);
            System.out.println("Correo de recuperación enviado a: " + destinatario);
        } catch (Exception e) {
            System.err.println("⚠️ Error al enviar correo de recuperación: " + e.getMessage());
            // No rompas la ejecución — el backend continúa normalmente
        }
    }

}
