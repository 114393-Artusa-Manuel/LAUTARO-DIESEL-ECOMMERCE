package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaRequest;
import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoStatusResponse;

public interface MercadoPagoService {
    CrearPreferenciaResponse crearPreferencia(CrearPreferenciaRequest req);
    void procesarWebhook(String type, String action, String paymentId, String rawJson);
    PagoStatusResponse getStatusByOrderId(String orderId);
}
