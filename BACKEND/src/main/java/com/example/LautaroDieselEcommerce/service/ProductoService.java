package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.producto.ProductoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;

import java.util.List;

public interface ProductoService {
    BaseResponse<List<ProductoDto>> getAll();
    BaseResponse<ProductoDto> getById(Long id);
    BaseResponse<ProductoDto> create(ProductoDto dto);
    BaseResponse<ProductoDto> update(Long id, ProductoDto dto);
    BaseResponse<String> delete(Long id);
    BaseResponse<List<ProductoDto>> filtrarProductos(Long categoriaId, Long marcaId, String nombre);
    BaseResponse<List<BaseResponse<ProductoDto>>> createBulk(List<ProductoDto> dtos);
}
