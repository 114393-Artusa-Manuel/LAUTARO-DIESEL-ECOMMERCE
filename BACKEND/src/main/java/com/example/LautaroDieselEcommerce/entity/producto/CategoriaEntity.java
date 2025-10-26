package com.example.LautaroDieselEcommerce.entity.producto;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Categoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCategoria")
    private Long idCategoria;

    @Column(name = "Nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "Slug", nullable = false, unique = true, length = 140)
    private String slug;

    @Column(name = "Activa", nullable = false)
    private Boolean activa = true;
}
