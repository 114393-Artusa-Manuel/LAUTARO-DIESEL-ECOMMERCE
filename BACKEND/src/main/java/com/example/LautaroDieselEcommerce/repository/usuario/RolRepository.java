package com.example.LautaroDieselEcommerce.repository.usuario;

import com.example.LautaroDieselEcommerce.entity.usuario.RolEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<RolEntity, Long> {
	Optional<RolEntity> findByNombre(String nombre);
}
