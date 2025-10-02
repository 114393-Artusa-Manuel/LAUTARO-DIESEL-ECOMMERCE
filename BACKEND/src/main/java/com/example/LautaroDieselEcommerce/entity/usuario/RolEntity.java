package com.example.LautaroDieselEcommerce.entity.usuario;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
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

    @ManyToMany(mappedBy = "roles")
    @JsonIgnore
    private List<UsuarioEntity> usuarios;
}
