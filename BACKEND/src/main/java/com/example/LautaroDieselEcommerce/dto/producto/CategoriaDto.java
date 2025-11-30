package com.example.LautaroDieselEcommerce.dto.producto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoriaDto {
    private Long idCategoria;
    private String nombre;
    private String slug;    
    private Long idPadre;
    private Boolean activa;
}
