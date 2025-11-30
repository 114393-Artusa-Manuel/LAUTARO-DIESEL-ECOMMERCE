package com.example.LautaroDieselEcommerce.dto.orden;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemOrdenDto {
    private Long idProducto;
    private Integer cantidad;
}
