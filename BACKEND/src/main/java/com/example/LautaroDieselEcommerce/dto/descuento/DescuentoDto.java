package com.example.LautaroDieselEcommerce.dto.descuento;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DescuentoDto {
    private Long idDescuento;
    private BigDecimal porcentaje;
    private Long idCategoria;
    private Long idUsuario;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Boolean activo;
}
