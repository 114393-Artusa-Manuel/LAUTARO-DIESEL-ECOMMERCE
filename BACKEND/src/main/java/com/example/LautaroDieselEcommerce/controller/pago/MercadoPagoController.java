package com.example.LautaroDieselEcommerce.controller.pago;

import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaRequest;
import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoStatusResponse;
import com.example.LautaroDieselEcommerce.service.MercadoPagoService;
import com.example.LautaroDieselEcommerce.service.impl.MercadoPagoServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class MercadoPagoController {

    @Autowired
    private MercadoPagoService pagoService;

    @PostMapping("/preference")
    public ResponseEntity<CrearPreferenciaResponse> createPreference(@RequestBody CrearPreferenciaRequest req) {
        return ResponseEntity.status(201).body(pagoService.crearPreferencia(req));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "id", required = false) String id,
            @RequestBody(required = false) Map<String, Object> body) {

        System.out.println("⚡ Webhook recibido topic=" + topic + " id=" + id);

        try {
            if (id == null && body != null && body.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                id = String.valueOf(data.get("id"));
            }

            if (topic == null && body != null && body.containsKey("topic")) {
                topic = String.valueOf(body.get("topic"));
            }

            if (topic == null || id == null) {
                System.out.println("⚠ Webhook inválido");
                return ResponseEntity.ok("IGNORED");
            }

            pagoService.procesarWebhook(topic, id, body != null ? body.toString() : null);
        } catch (Exception e) {
            System.out.println("❌ Error procesando webhook: " + e.getMessage());
        }

        return ResponseEntity.ok("OK");
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<PagoStatusResponse> getStatus(@PathVariable String orderId) {
        return ResponseEntity.ok(pagoService.getStatusByOrderId(orderId));
    }
}
