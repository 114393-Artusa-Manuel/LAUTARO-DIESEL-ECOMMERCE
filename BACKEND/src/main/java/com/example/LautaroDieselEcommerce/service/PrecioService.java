package com.example.LautaroDieselEcommerce.service;

import java.math.BigDecimal;

import com.example.LautaroDieselEcommerce.entity.producto.VarianteEntity;

public interface PrecioService {
    BigDecimal precioFinal(VarianteEntity variante);
}