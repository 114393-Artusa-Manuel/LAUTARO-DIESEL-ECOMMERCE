package com.example.LautaroDieselEcommerce.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.example.LautaroDieselEcommerce.entity.producto.VarianteEntity;
import com.example.LautaroDieselEcommerce.service.PrecioService;
import org.springframework.stereotype.Service;

@Service
public class PrecioServiceImpl implements PrecioService {

    @Override
    public BigDecimal precioFinal(VarianteEntity v) {
        // 🔹 Precio base desde la entidad Variante
        BigDecimal base = v.getPrecioBase();

        // 🔹 IVA fijo del 21 %
        BigDecimal iva = base.multiply(new BigDecimal("0.21"));

        // 🔹 Total final redondeado a 2 decimales
        return base.add(iva).setScale(2, RoundingMode.HALF_UP);
    }
    
}
