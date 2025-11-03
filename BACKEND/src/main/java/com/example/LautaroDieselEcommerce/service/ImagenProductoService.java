package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.imagen.ImagenProductoDto;

import java.util.List;

public interface ImagenProductoService {
    ImagenProductoDto agregarImagen(Long idProducto, ImagenProductoDto dto);
    List<ImagenProductoDto> obtenerPorProducto(Long idProducto);
}

