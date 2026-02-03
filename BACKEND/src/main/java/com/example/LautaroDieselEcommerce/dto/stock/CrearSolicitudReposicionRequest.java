package com.example.LautaroDieselEcommerce.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearSolicitudReposicionRequest {
    private Long proveedorId; // opcional si tenés proveedores
    private List<Item> items;

    public static class Item {
        private Long productoId;
        private Integer cantidad;
    }
}
