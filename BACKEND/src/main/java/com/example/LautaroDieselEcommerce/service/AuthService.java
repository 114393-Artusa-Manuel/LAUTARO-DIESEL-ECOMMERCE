package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.login.LoginRequest;
import com.example.LautaroDieselEcommerce.dto.login.LoginResponse;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;

public interface AuthService {
    BaseResponse<LoginResponse> login(LoginRequest request);
}
