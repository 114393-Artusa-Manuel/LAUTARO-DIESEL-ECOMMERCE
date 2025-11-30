package com.example.LautaroDieselEcommerce.repository.pago;

import com.example.LautaroDieselEcommerce.entity.pago.PagoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<PagoEntity, Long> {
    Optional<PagoEntity> findByOrderId(String orderId);
    Optional<PagoEntity> findByPreferenceId(String preferenceId);
    Optional<PagoEntity> findByPaymentId(String paymentId);
    Optional<PagoEntity> findFirstByOrderId(String orderId);

}
