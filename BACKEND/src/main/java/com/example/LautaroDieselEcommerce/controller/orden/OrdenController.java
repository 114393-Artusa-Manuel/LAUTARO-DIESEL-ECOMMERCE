package com.example.LautaroDieselEcommerce.controller.orden;

import com.example.LautaroDieselEcommerce.dto.orden.OrdenRequestDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.service.OrdenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @PostMapping("/confirmar")
    public ResponseEntity<BaseResponse<?>> confirmarOrden(@RequestBody OrdenRequestDto request) {
        BaseResponse<?> response = ordenService.confirmarOrden(request);
        return ResponseEntity.status(response.getCodigo()).body(response);
    }
}
