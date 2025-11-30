package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.orden.OrdenRequestDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;

public interface OrdenService {
    BaseResponse<?> confirmarOrden(OrdenRequestDto request);
    Long crearOrden(OrdenRequestDto request);
}
