
package com.example.LautaroDieselEcommerce.dto.producto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarcaDto {
  private Long idMarca;
  private String nombre;
  private Boolean activa;
}