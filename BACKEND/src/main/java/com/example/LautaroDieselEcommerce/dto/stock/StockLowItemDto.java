package com.example.LautaroDieselEcommerce.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockLowItemDto {
    private Long productoId;
    private String nombre;
    private String marca;
    private String categoria;
    private Integer stockActual;
    private Integer umbral;
    private Integer sugeridoReponer; // ej: para llevarlo a 10
    private Boolean activo;
}
