package com.example.LautaroDieselEcommerce.entity.recuperar_clave;

import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "RecuperacionClave")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecuperacionClaveEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdRecuperacion")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private UsuarioEntity usuario;

    @Column(name = "Token", nullable = false, unique = true, length = 64)
    private String token;

    @Column(name = "ExpiraEn", nullable = false)
    private LocalDateTime expiraEn;

    @Column(name = "Usado", nullable = false)
    private Boolean usado = false;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
