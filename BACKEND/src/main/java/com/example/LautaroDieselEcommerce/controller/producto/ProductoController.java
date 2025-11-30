package com.example.LautaroDieselEcommerce.controller.producto;

import com.example.LautaroDieselEcommerce.dto.producto.ProductoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:4200","http://localhost:5678"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping("/filtrar")
    public ResponseEntity<BaseResponse<List<ProductoDto>>> filtrarProductos(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long marcaId,
            @RequestParam(required = false) String nombre) {
        BaseResponse<List<ProductoDto>> response = productoService.filtrarProductos(categoriaId, marcaId, nombre);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

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

    @PostMapping("/bulk")
    public ResponseEntity<BaseResponse<?>> createBulk(@RequestBody List<ProductoDto> dtos) {
    return ResponseEntity.status(HttpStatus.MULTI_STATUS)
            .body(productoService.createBulk(dtos));
    }
}
