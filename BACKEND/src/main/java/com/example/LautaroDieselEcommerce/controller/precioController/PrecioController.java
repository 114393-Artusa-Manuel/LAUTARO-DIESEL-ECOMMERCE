package com.example.LautaroDieselEcommerce.controller.precioController;

import com.example.LautaroDieselEcommerce.repository.producto.VarianteRepository;
import com.example.LautaroDieselEcommerce.service.PrecioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;


@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/variantes")
@RequiredArgsConstructor
public class PrecioController {

    private final VarianteRepository variantes;
    private final PrecioService precios;

    @GetMapping("/{id}/precio")
    public BigDecimal obtenerPrecio(@PathVariable Long id) {
        var v = variantes.findById(id).orElseThrow();
        return precios.precioFinal(v);
    }
}