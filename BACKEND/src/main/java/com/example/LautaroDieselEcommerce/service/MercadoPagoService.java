package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaRequest;
import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoStatusResponse;

public interface MercadoPagoService {
    CrearPreferenciaResponse crearPreferencia(CrearPreferenciaRequest req);
    void procesarWebhook(String topic, String id, String rawJson);

    PagoStatusResponse getStatusByOrderId(String orderId);
    void procesarPago(String paymentId, String rawJson);

    void procesarMerchantOrder(String merchantOrderId, String rawJson);
}
