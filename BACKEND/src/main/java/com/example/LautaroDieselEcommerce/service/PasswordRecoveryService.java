package com.example.LautaroDieselEcommerce.service;


import com.example.LautaroDieselEcommerce.dto.recuperar_clave.PasswordRecoveryRequest;
import com.example.LautaroDieselEcommerce.dto.recuperar_clave.ResetPasswordRequest;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;

public interface PasswordRecoveryService {
    BaseResponse<String> solicitarRecuperacion(PasswordRecoveryRequest request, String appBaseUrl);
    BaseResponse<String> resetearPassword(ResetPasswordRequest request);
}
