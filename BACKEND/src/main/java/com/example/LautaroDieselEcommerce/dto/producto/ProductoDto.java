package com.example.LautaroDieselEcommerce.dto.producto;

import com.example.LautaroDieselEcommerce.dto.imagen.ImagenProductoDto;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
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

    
    private BigDecimal precio;         // ej: 150000.00
    private String moneda;             // ej: "ARS"
    private Boolean varianteActiva;    // default true

    public List<ImagenProductoDto> imagenes;

}
