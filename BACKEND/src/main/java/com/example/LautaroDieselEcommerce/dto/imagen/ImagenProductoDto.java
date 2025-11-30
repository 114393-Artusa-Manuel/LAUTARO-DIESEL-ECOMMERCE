package com.example.LautaroDieselEcommerce.dto.imagen;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImagenProductoDto {
    private Long idImagen;
    private String url;
    private String textoAlt;
    private int orden;
}
