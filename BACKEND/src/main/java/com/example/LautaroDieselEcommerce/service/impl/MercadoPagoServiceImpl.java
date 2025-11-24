package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaRequest;
import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoStatusResponse;
import com.example.LautaroDieselEcommerce.entity.orden.OrdenEntity;
import com.example.LautaroDieselEcommerce.entity.pago.PagoEntity;
import com.example.LautaroDieselEcommerce.repository.orden.OrdenRepository;
import com.example.LautaroDieselEcommerce.repository.pago.PagoRepository;
import com.example.LautaroDieselEcommerce.service.MercadoPagoService;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class MercadoPagoServiceImpl implements MercadoPagoService {

    private final PagoRepository pagoRepo;
    private final OrdenRepository ordenRepo;

    @Value("${app.frontend.base-url}")
    private String frontend;

    @Value("${app.backend.base-url}")
    private String backend;

    @Value("${mercadopago.access_token}")
    private String mpAccessToken;

    // ================================================================
    // MÉTO DO PARA NORMALIZAR STRINGS Y EVITAR ERRORES EN MERCADO PAGO
    // ================================================================
    private String normalizar(String texto) {
        if (texto == null) return "";
        String limpio = Normalizer.normalize(texto, Normalizer.Form.NFD);
        limpio = limpio.replaceAll("\\p{M}", ""); // Quita acentos
        limpio = limpio.replaceAll("[^A-Za-z0-9 .,-]", ""); // Quita caracteres inválidos
        return limpio;
    }

    // ================================================================
    // CREAR PREFERENCIA
    // ================================================================
    @Override
    public CrearPreferenciaResponse crearPreferencia(CrearPreferenciaRequest req) {

        try {
            MercadoPagoConfig.setAccessToken(mpAccessToken);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al configurar credenciales de Mercado Pago",
                    e
            );
        }

        // 🔹 Crear lista de ítems
        List<PreferenceItemRequest> items = req.getItems().stream().map(it ->
                PreferenceItemRequest.builder()
                        .id(it.getId())
                        .title(normalizar(it.getTitle()))   // <<<<<<<<<<<<<< AQUI SE ARREGLA
                        .quantity(it.getQuantity())
                        .currencyId(req.getCurrency())
                        .unitPrice(it.getUnitPrice())
                        .build()
        ).toList();

        // 🔹 Armar preferencia
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .payer(PreferencePayerRequest.builder()
                        .email(req.getPayerEmail())
                        .build())
                .backUrls(
                        PreferenceBackUrlsRequest.builder()
                                .success(frontend + "/checkout/success")
                                .pending(frontend + "/checkout/pending")
                                .failure(frontend + "/checkout/failure")
                                .build()
                )
                //.autoReturn("approved")
                .notificationUrl(backend + "/api/payments/webhook")
                .externalReference(req.getOrderId())
                .build();

        // 🔥🔥🔥 LOG AQUI — MUESTRA LA PREFERENCIA EXACTA QUE ROMPE MERCADO PAGO
        System.out.println("========== PREFERENCE JSON ==========");
        System.out.println(preferenceRequest);
        System.out.println("=====================================");

        Preference preference;
        try {
            PreferenceClient client = new PreferenceClient();
            preference = client.create(preferenceRequest);
        } catch (Exception e) {
            if (e instanceof MPApiException mpEx) {
                System.out.println("========== ERROR MERCADO PAGO ==========");
                System.out.println("Status code: " + mpEx.getApiResponse().getStatusCode());
                System.out.println("Body: " + mpEx.getApiResponse().getContent());
                System.out.println("========================================");
            }
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Error al crear la preferencia en Mercado Pago (ver consola).",
                        e
            );
        }

        // 🔹 Calcular total
        BigDecimal total = req.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔹 Guardar pago
        PagoEntity pago = PagoEntity.builder()
                .orderId(req.getOrderId())
                .preferenceId(preference.getId())
                .payerEmail(req.getPayerEmail())
                .currency(req.getCurrency())
                .amount(total)
                .status("created")
                .dateCreated(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        pagoRepo.save(pago);

        return new CrearPreferenciaResponse(
                preference.getId(),
                preference.getInitPoint(),
                preference.getSandboxInitPoint()
        );
    }

    // ================================================================
    // WEBHOOK
    // ================================================================
    @Override
    public void procesarWebhook(String type, String action, String paymentId, String rawJson) {

        if (!"payment".equalsIgnoreCase(type) || paymentId == null) return;

        MercadoPagoConfig.setAccessToken(mpAccessToken);

        Payment payment;
        try {
            PaymentClient paymentClient = new PaymentClient();
            payment = paymentClient.get(Long.parseLong(paymentId));
        } catch (Exception e) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al obtener el pago desde Mercado Pago: " + e.getMessage(),
                    e
            );
        }

        String status = payment.getStatus();
        String statusDetail = payment.getStatusDetail();
        String orderId = payment.getExternalReference();

        PagoEntity pago = pagoRepo.findByOrderId(orderId)
                .orElseThrow(() ->
                        new ResponseStatusException(NOT_FOUND, "Pago no encontrado para orderId: " + orderId)
                );

        pago.setPaymentId(String.valueOf(payment.getId()));
        pago.setStatus(status);
        pago.setStatusDetail(statusDetail);
        pago.setUpdatedAt(LocalDateTime.now());
        if ("approved".equalsIgnoreCase(status)) {
            pago.setDateApproved(LocalDateTime.now());
        }
        pago.setRawNotificationJson(rawJson);
        pagoRepo.save(pago);

        try {
            Long idOrden = Long.parseLong(orderId);
            OrdenEntity orden = ordenRepo.findById(idOrden).orElse(null);
            if (orden != null) {
                if ("approved".equalsIgnoreCase(status)) orden.setEstado("CONFIRMADA");
                else if ("rejected".equalsIgnoreCase(status)) orden.setEstado("RECHAZADA");
                else orden.setEstado("PENDIENTE");
                ordenRepo.save(orden);
            }
        } catch (NumberFormatException e) {
            // ignoramos si no es numérico
        }
    }

    // ================================================================
    // CONSULTAR ESTADO PAGO
    // ================================================================
    @Override
    public PagoStatusResponse getStatusByOrderId(String orderId) {
        PagoEntity p = pagoRepo.findByOrderId(orderId)
                .orElseThrow(() ->
                        new ResponseStatusException(NOT_FOUND, "Pago no encontrado para orderId: " + orderId)
                );

        return new PagoStatusResponse(
                p.getOrderId(),
                p.getPreferenceId(),
                p.getPaymentId(),
                p.getStatus(),
                p.getStatusDetail()
        );
    }
}
