package com.example.LautaroDieselEcommerce.dto.producto;

import lombok.*;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoDto {
    private Long idProducto;
    private String nombre;
    private String slug;
    private String descripcion;
    private Boolean activo;

    private Set<Long> marcasIds;      // IDs de las marcas asociadas
    private Set<Long> categoriasIds;  // IDs de las categorías asociadas
}
