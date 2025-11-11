package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaRequest;
import com.example.LautaroDieselEcommerce.dto.pago.CrearPreferenciaResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoStatusResponse;
import com.example.LautaroDieselEcommerce.entity.orden.OrdenEntity;
import com.example.LautaroDieselEcommerce.entity.pago.PagoEntity;
import com.example.LautaroDieselEcommerce.repository.orden.OrdenRepository;
import com.example.LautaroDieselEcommerce.repository.pago.PagoRepository;
import com.example.LautaroDieselEcommerce.service.MercadoPagoService;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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

    // ================================================================
    // CREAR PREFERENCIA
    // ================================================================
    @Override
    public CrearPreferenciaResponse crearPreferencia(CrearPreferenciaRequest req) {

        // 🔹 Crear lista de ítems
        List<PreferenceItemRequest> items = req.getItems().stream().map(it ->
                PreferenceItemRequest.builder()
                        .id(it.getId())
                        .title(it.getTitle())
                        .quantity(it.getQuantity())
                        .currencyId(req.getCurrency())
                        .unitPrice(it.getUnitPrice())
                        .build()
        ).toList();

        // 🔹 Armar preferencia de Mercado Pago
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
                .autoReturn("approved")
                .notificationUrl(backend + "/api/payments/webhook")
                .externalReference(req.getOrderId()) // guardamos el idOrden como referencia
                .build();

        Preference preference;
        try {
            PreferenceClient client = new PreferenceClient();
            preference = client.create(preferenceRequest);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al crear la preferencia en Mercado Pago: " + e.getMessage(),
                    e
            );
        }

        // 🔹 Calcular total
        BigDecimal total = req.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔹 Guardar registro del pago (estado inicial "created")
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

        // 🔹 Devolver URLs y ID de preferencia
        return new CrearPreferenciaResponse(
                preference.getId(),
                preference.getInitPoint(),
                preference.getSandboxInitPoint()
        );
    }

    // ================================================================
    // PROCESAR WEBHOOK (respuesta automática de MP)
    // ================================================================
    @Override
    public void procesarWebhook(String type, String action, String paymentId, String rawJson) {

        if (!"payment".equalsIgnoreCase(type) || paymentId == null) return;

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

        // 🔹 Extraer información del pago
        String status = payment.getStatus();           // approved, pending, rejected
        String statusDetail = payment.getStatusDetail();
        String orderId = payment.getExternalReference(); // el idOrden que mandamos

        // 🔹 Buscar el pago en la base de datos
        PagoEntity pago = pagoRepo.findByOrderId(orderId)
                .orElseThrow(() ->
                        new ResponseStatusException(NOT_FOUND, "Pago no encontrado para orderId: " + orderId)
                );

        // 🔹 Actualizar datos del pago
        pago.setPaymentId(String.valueOf(payment.getId()));
        pago.setStatus(status);
        pago.setStatusDetail(statusDetail);
        pago.setUpdatedAt(LocalDateTime.now());
        if ("approved".equalsIgnoreCase(status)) {
            pago.setDateApproved(LocalDateTime.now());
        }
        pago.setRawNotificationJson(rawJson);
        pagoRepo.save(pago);

        // 🔹 Actualizar el estado de la orden si existe
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
            // Si orderId no es numérico, ignoramos
        }
    }

    // ================================================================
    // CONSULTAR ESTADO DE PAGO POR ORDERID
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
