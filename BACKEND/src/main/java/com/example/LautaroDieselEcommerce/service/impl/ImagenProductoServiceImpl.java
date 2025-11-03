package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.imagen.ImagenProductoDto;
import com.example.LautaroDieselEcommerce.entity.imagen.ImagenProductoEntity;
import com.example.LautaroDieselEcommerce.repository.imagen.ImagenProductoRepository;
import com.example.LautaroDieselEcommerce.repository.producto.ProductoRepository;
import com.example.LautaroDieselEcommerce.service.ImagenProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ImagenProductoServiceImpl implements ImagenProductoService {

    @Autowired
    private ImagenProductoRepository imagenRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public ImagenProductoDto agregarImagen(Long idProducto, ImagenProductoDto dto) {
        var producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        ImagenProductoEntity imagen = new ImagenProductoEntity();
        imagen.setProducto(producto);
        imagen.setUrl(dto.getUrl());
        imagen.setTextoAlt(dto.getTextoAlt());
        imagen.setOrden(dto.getOrden());

        imagenRepository.save(imagen);

        dto.setIdImagen(imagen.getIdImagen());
        return dto;
    }

    @Override
    public List<ImagenProductoDto> obtenerPorProducto(Long idProducto) {
        return imagenRepository.findByProducto_IdProductoOrderByOrdenAsc(idProducto)
                .stream()
                .map(img -> {
                    ImagenProductoDto dto = new ImagenProductoDto();
                    dto.setIdImagen(img.getIdImagen());
                    dto.setUrl(img.getUrl());
                    dto.setTextoAlt(img.getTextoAlt());
                    dto.setOrden(img.getOrden());
                    return dto;
                })
                .toList();
    }
}

