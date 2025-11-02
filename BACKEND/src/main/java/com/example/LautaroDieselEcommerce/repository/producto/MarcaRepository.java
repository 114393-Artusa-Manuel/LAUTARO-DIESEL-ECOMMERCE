package com.example.LautaroDieselEcommerce.repository.producto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.LautaroDieselEcommerce.entity.producto.MarcaEntity;

public interface MarcaRepository extends JpaRepository<MarcaEntity, Long> {
  boolean existsByNombreIgnoreCase(String nombre);
  List<MarcaEntity> findAllByActivaTrueOrderByNombreAsc();
}
