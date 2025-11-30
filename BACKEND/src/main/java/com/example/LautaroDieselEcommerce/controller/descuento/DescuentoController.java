package com.example.LautaroDieselEcommerce.controller.descuento;

import com.example.LautaroDieselEcommerce.dto.descuento.DescuentoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.service.DescuentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/descuentos")
@RequiredArgsConstructor
public class DescuentoController {

    private final DescuentoService descuentoService;

    @PostMapping
    public ResponseEntity<BaseResponse<?>> create(@RequestBody DescuentoDto dto) {
        var res = descuentoService.create(dto);
        return ResponseEntity.status(res.getCodigo()).body(res);
    }

    @GetMapping
    public ResponseEntity<BaseResponse<?>> getAll() {
        var res = descuentoService.getAll();
        return ResponseEntity.status(res.getCodigo()).body(res);
    }

    @GetMapping("/aplicables/{idUsuario}")
    public ResponseEntity<BaseResponse<?>> getAplicables(@PathVariable Long idUsuario) {
        var res = descuentoService.aplicarDescuentosCarrito(idUsuario);
        return ResponseEntity.status(res.getCodigo()).body(res);
    }
}
