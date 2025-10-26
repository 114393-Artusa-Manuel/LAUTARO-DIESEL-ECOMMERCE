package com.example.LautaroDieselEcommerce.entity.producto;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Marca")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarcaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdMarca")
    private Long idMarca;

    @Column(name = "Nombre", nullable = false, unique = true, length = 120)
    private String nombre;

    @Column(name = "Activa", nullable = false)
    private Boolean activa = true;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
