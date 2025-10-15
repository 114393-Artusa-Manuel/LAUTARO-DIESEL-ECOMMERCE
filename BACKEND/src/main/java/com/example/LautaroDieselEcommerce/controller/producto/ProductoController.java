package com.example.LautaroDieselEcommerce.controller.producto;

import com.example.LautaroDieselEcommerce.dto.producto.ProductoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {


    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<BaseResponse<?>> getAll() {
        return ResponseEntity.ok(productoService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.getById(id));
    }

    @PostMapping
    public ResponseEntity<BaseResponse<?>> create(@RequestBody ProductoDto dto) {
        return ResponseEntity.status(201).body(productoService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<?>> update(@PathVariable Long id, @RequestBody ProductoDto dto) {
        return ResponseEntity.ok(productoService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<?>> delete(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.delete(id));
    }
}
