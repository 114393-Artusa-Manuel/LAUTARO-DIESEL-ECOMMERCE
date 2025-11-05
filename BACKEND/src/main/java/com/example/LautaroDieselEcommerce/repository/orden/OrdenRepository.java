package com.example.LautaroDieselEcommerce.repository.orden;

import com.example.LautaroDieselEcommerce.entity.orden.OrdenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdenRepository extends JpaRepository<OrdenEntity, Long> { }
