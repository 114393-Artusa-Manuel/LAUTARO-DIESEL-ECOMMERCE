package com.example.LautaroDieselEcommerce.service;

import java.util.List;

import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.producto.CategoriaDto;

public interface CategoriaService {
  BaseResponse<List<CategoriaDto>> getAll();
  BaseResponse<List<CategoriaDto>> getAllActivas();
  BaseResponse<CategoriaDto> getById(Long id);
  BaseResponse<CategoriaDto> create(CategoriaDto dto);
  BaseResponse<CategoriaDto> update(Long id, CategoriaDto dto);
  BaseResponse<String> delete(Long id);
}