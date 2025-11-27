package com.example.LautaroDieselEcommerce.controller.pago;

import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaRequest;
import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoStatusResponse;
import com.example.LautaroDieselEcommerce.service.MercadoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class MercadoPagoController {

    private final MercadoPagoService pagoService;

    @PostMapping("/preference")
    public ResponseEntity<CrearPreferenciaResponse> createPreference(@RequestBody CrearPreferenciaRequest req) {
        return ResponseEntity.status(201).body(pagoService.crearPreferencia(req));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody(required = false) Map<String, Object> webhook,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false, name = "type") String type,
            @RequestParam(required = false, name = "data.id") String dataId) {

        System.out.println("⚡ Webhook recibido");

        String paymentId = null;

        if (dataId != null) paymentId = dataId;
        if (webhook != null && webhook.containsKey("data")) {
            Object dataObj = webhook.get("data");
            if (dataObj instanceof Map data && data.get("id") != null)
                paymentId = String.valueOf(data.get("id"));
        }
        if (paymentId == null && webhook.containsKey("resource")) {
            String res = String.valueOf(webhook.get("resource"));
            paymentId = res.substring(res.lastIndexOf("/") + 1);
        }
        if (paymentId == null && id != null) paymentId = id;

        if (paymentId == null) {
            return ResponseEntity.badRequest().body("Missing payment ID");
        }

        pagoService.procesarWebhook("payment", null, paymentId, webhook.toString());
        return ResponseEntity.ok("OK");
    }


    @GetMapping("/status/{orderId}")
    public ResponseEntity<PagoStatusResponse> getStatus(@PathVariable String orderId) {
        return ResponseEntity.ok(pagoService.getStatusByOrderId(orderId));
    }
}
