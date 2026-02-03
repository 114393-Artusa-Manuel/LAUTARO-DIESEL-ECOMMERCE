package com.example.LautaroDieselEcommerce.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearSolicitudReposicionResponse {
    private Long solicitudId;
    private Integer totalItems;
    private String estado;
}
