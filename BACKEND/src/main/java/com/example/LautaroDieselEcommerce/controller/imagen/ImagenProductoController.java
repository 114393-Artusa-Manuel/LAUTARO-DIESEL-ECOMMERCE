package com.example.LautaroDieselEcommerce.controller.imagen;

import com.example.LautaroDieselEcommerce.dto.imagen.ImagenProductoDto;
import com.example.LautaroDieselEcommerce.service.ImagenProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/imagenes-producto")
public class ImagenProductoController {

    @Autowired
    private ImagenProductoService imagenService;

    @PostMapping("/{idProducto}")
    public ResponseEntity<ImagenProductoDto> agregar(
            @PathVariable Long idProducto,
            @RequestBody ImagenProductoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(imagenService.agregarImagen(idProducto, dto));
    }

    @GetMapping("/{idProducto}")
    public ResponseEntity<List<ImagenProductoDto>> obtenerPorProducto(@PathVariable Long idProducto) {
        return ResponseEntity.ok(imagenService.obtenerPorProducto(idProducto));
    }
}

