package com.example.LautaroDieselEcommerce.repository.recuperar_clave;

import com.example.LautaroDieselEcommerce.entity.recuperar_clave.RecuperacionClaveEntity;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RecuperacionClaveRepository extends JpaRepository<RecuperacionClaveEntity, Long> {
    Optional<RecuperacionClaveEntity> findByTokenAndUsadoFalseAndExpiraEnAfter(String token, LocalDateTime fecha);
    void deleteByUsuario(UsuarioEntity usuario);
}
