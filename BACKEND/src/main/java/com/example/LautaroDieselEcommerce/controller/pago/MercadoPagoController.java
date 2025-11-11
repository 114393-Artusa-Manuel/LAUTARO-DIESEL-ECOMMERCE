package com.example.LautaroDieselEcommerce.controller.pago;

import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaRequest;
import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoStatusResponse;
import com.example.LautaroDieselEcommerce.service.MercadoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class MercadoPagoController {

    private final MercadoPagoService pagoService;

    @PostMapping("/preference")
    public ResponseEntity<CrearPreferenciaResponse> createPreference(@RequestBody CrearPreferenciaRequest req) {
        return ResponseEntity.status(201).body(pagoService.crearPreferencia(req));
    }

    // Webhook público (MP envía type, action, data.id por query o body)
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody(required = false) String rawJson,
            @RequestParam(required = false, name="type") String type,
            @RequestParam(required = false, name="action") String action,
            @RequestParam(required = false, name="data.id") String dataId) {
        pagoService.procesarWebhook(type, action, dataId, rawJson);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<PagoStatusResponse> getStatus(@PathVariable String orderId) {
        return ResponseEntity.ok(pagoService.getStatusByOrderId(orderId));
    }
}
