package com.example.LautaroDieselEcommerce.entity.producto;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Variante")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VarianteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdVariante")
    private Long idVariante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdProducto", nullable = false)
    private ProductoEntity producto;

    @Column(name = "Sku", nullable = false, length = 80)
    private String sku;

    @Column(name = "Precio", precision = 18, scale = 2, nullable = false)
    private BigDecimal precioBase;

    @Column(name = "Moneda", length = 3, nullable = false)
    private String moneda; // se normaliza en service

    // 🔧 AQUÍ ESTABA EL PROBLEMA: el nombre real en DB es "Activo"
    @Column(name = "Activo", nullable = false)
    private Boolean activo;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "FechaActualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (fechaCreacion == null)      fechaCreacion = now;
        if (fechaActualizacion == null) fechaActualizacion = now;
        if (moneda == null || moneda.isBlank()) moneda = "ARS";
        if (activo == null) activo = true;
    }

    @PreUpdate
    void preUpdate() {
        fechaActualizacion = LocalDateTime.now();
        if (moneda == null || moneda.isBlank()) moneda = "ARS";
        if (activo == null) activo = true;
    }
}
