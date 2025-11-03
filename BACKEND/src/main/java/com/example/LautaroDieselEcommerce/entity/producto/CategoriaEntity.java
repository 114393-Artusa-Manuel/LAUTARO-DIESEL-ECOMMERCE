package com.example.LautaroDieselEcommerce.entity.producto;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Categoria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCategoria")
    private Long idCategoria;

    @Column(name = "Nombre", nullable = false, length = 120, unique = true)
    private String nombre;

    @Column(name = "Slug", nullable = false, length = 140, unique = true)
    private String slug; // <-- requerido por la DB

    @Column(name = "IdPadre")
    private Long idPadre;

    @Column(name = "Activa", nullable = false)
    private Boolean activa = true;

    @Column(name = "FechaCreacion", nullable = false, columnDefinition = "DATETIME2 DEFAULT GETDATE()")
    private LocalDateTime fechaCreacion;


    @PrePersist
    void prePersist() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (activa == null) activa = true;
        if (slug == null || slug.isBlank()) {
            slug = generarSlug(nombre);
        }
    }

    @PreUpdate
    void preUpdate() {
        if (slug == null || slug.isBlank()) {
            slug = generarSlug(nombre);
        }
    }

    private String generarSlug(String s) {
        if (s == null) return "categoria";
        String ascii = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String base = ascii.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return base.isBlank() ? "categoria" : base;
    }
}
