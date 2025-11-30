package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.descuento.DescuentoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;

import java.util.List;

public interface DescuentoService {
    BaseResponse<DescuentoDto> create(DescuentoDto dto);
    BaseResponse<List<DescuentoDto>> getAll();
    BaseResponse<?> aplicarDescuentosCarrito(Long idUsuario);
}
