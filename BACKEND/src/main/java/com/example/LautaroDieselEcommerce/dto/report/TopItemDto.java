package com.example.LautaroDieselEcommerce.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopItemDto {
    private Long idProducto;
    private String nombre;
    private Long totalCantidad;
    private BigDecimal totalRevenue;
    private String imageUrl;

    public TopItemDto(Long idProducto, String nombre, Long totalCantidad, Double totalRevenueDouble) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.totalCantidad = totalCantidad;
        this.totalRevenue = totalRevenueDouble == null ? BigDecimal.ZERO : BigDecimal.valueOf(totalRevenueDouble);
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
