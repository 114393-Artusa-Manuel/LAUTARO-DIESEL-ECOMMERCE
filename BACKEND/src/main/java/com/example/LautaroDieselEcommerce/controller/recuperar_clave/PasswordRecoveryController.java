package com.example.LautaroDieselEcommerce.controller.recuperar_clave;


import com.example.LautaroDieselEcommerce.dto.recuperar_clave.PasswordRecoveryRequest;
import com.example.LautaroDieselEcommerce.dto.recuperar_clave.ResetPasswordRequest;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.service.PasswordRecoveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class PasswordRecoveryController {

    @Autowired
    private PasswordRecoveryService passwordRecoveryService;

    @Value("${app.frontend.base-url:http://localhost:4200}")
    private String frontendBaseUrl;

    public PasswordRecoveryController(PasswordRecoveryService passwordRecoveryService) {
        this.passwordRecoveryService = passwordRecoveryService;
    }

    @PostMapping("/recover")
    public ResponseEntity<BaseResponse<String>> solicitar(@Valid @RequestBody PasswordRecoveryRequest request) {
        return ResponseEntity.ok(passwordRecoveryService.solicitarRecuperacion(request, frontendBaseUrl));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<BaseResponse<String>> reset(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(passwordRecoveryService.resetearPassword(request));
    }
}
