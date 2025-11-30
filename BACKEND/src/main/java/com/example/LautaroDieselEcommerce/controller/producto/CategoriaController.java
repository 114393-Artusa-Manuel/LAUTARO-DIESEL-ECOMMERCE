package com.example.LautaroDieselEcommerce.controller.producto;

import com.example.LautaroDieselEcommerce.dto.producto.CategoriaDto;
import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.service.CategoriaService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService svc;

    @GetMapping
    public ResponseEntity<BaseResponse<List<CategoriaDto>>> getAll() {
        return ResponseEntity.ok(svc.getAll());
    }

    @GetMapping("/activas")
    public ResponseEntity<BaseResponse<List<CategoriaDto>>> getAllActivas() {
        return ResponseEntity.ok(svc.getAllActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(svc.getById(id));
    }

    @PostMapping
    public ResponseEntity<BaseResponse<?>> create(@RequestBody CategoriaDto dto) {
        return ResponseEntity.status(201).body(svc.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<?>> update(@PathVariable Long id, @RequestBody CategoriaDto dto) {
        return ResponseEntity.ok(svc.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<?>> delete(@PathVariable Long id) {
        return ResponseEntity.ok(svc.delete(id));
    }
}
