package com.example.LautaroDieselEcommerce.entity.usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "Rol")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdRol")
    private Long id;

    @Column(name = "Nombre", nullable = false, unique = true)
    private String nombre;

    @Column(name = "Descripcion")
    private String descripcion;

    @Column(name = "FechaCreacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "FechaModificacion")
    private LocalDateTime fechaModificacion = LocalDateTime.now();

    @ManyToMany(mappedBy = "roles")
    private Set<UsuarioEntity> usuarios;
}
