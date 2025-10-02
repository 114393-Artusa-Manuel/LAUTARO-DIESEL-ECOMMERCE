package com.example.LautaroDieselEcommerce.entity.usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "Usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuario")
    private Long id;

    @Column(name = "Correo", nullable = false, unique = true, length = 255)
    private String correo;

    @Column(name = "ClaveHash", nullable = false, length = 256)
    private String claveHash;

    @Column(name = "NombreCompleto", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(name = "Telefono", length = 50)
    private String telefono;

    @Column(name = "Segmento", length = 30)
    private String segmento;

    @Column(name = "Activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "FechaActualizacion", nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "UsuarioRol",
            joinColumns = @JoinColumn(name = "IdUsuario"),
            inverseJoinColumns = @JoinColumn(name = "IdRol")
    )
    private List<RolEntity> roles = new ArrayList<>();

}
