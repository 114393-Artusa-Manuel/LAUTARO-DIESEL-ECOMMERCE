package com.example.LautaroDieselEcommerce.service;

import java.util.List;

import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.producto.MarcaDto;

public interface MarcaService {
  BaseResponse<List<MarcaDto>> getAll();
  BaseResponse<List<MarcaDto>> getAllActivas();
  BaseResponse<MarcaDto> getById(Long id);
  BaseResponse<MarcaDto> create(MarcaDto dto);
  BaseResponse<MarcaDto> update(Long id, MarcaDto dto);
  BaseResponse<String> delete(Long id);
}