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
import com.mercadopago.client.merchantorder.MerchantOrderClient;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.resources.merchantorder.MerchantOrder;
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

    @Override
    public CrearPreferenciaResponse crearPreferencia(CrearPreferenciaRequest req) {

        System.out.println("🚀 Crear Preferencia - OrderID: " + req.getOrderId());

        MercadoPagoConfig.setAccessToken(mpAccessToken);

        List<PreferenceItemRequest> items = req.getItems().stream().map(it ->
                PreferenceItemRequest.builder()
                        .id(it.getId())
                        .title((it.getTitle()))
                        .quantity(it.getQuantity())
                        .currencyId(req.getCurrency())
                        .unitPrice(it.getUnitPrice())
                        .build()
        ).toList();

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
                .notificationUrl(backend + "/api/payments/webhook")
                .externalReference(req.getOrderId())
                .autoReturn("")
                .build();

        try {
            System.out.println("📡 Enviando request a MercadoPago:");
            System.out.println(preferenceRequest);

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            System.out.println("📥 Respuesta MercadoPago:");
            System.out.println("🆔 Preference ID = " + preference.getId());
            System.out.println("🔗 InitPoint = " + preference.getInitPoint());

            if (preference.getId() == null) {
                throw new RuntimeException("⚠️ MercadoPago devolvió preferenceId NULL");
            }

            BigDecimal total = req.getItems().stream()
                    .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            pagoRepo.save(PagoEntity.builder()
                    .orderId(req.getOrderId())
                    .preferenceId(preference.getId())
                    .payerEmail(req.getPayerEmail())
                    .currency(req.getCurrency())
                    .amount(total)
                    .status("pending")
                    .dateCreated(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());

            return new CrearPreferenciaResponse(
                    preference.getId(),
                    preference.getInitPoint()
            );

        } catch (Exception e) {

            System.out.println("❌ ERROR MercadoPago: " + e.getMessage());

            if (e instanceof com.mercadopago.exceptions.MPApiException mpApiEx) {
                System.out.println("💥 MP ERROR DETAIL: " +
                        mpApiEx.getApiResponse().getContent());
            }

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al crear preferencia", e
            );
        }
    }


    @Override
    public void procesarWebhook(String type, String action, String id, String rawJson) {

        if (id == null) return;

        MercadoPagoConfig.setAccessToken(mpAccessToken);

        switch (type.toLowerCase()) {
            case "payment" -> procesarPagoDirecto(id, rawJson);
            case "merchant_order" -> procesarMerchantOrder(id, rawJson);
        }
    }

    private void procesarPagoDirecto(String paymentEventId, String rawJson) {
        try {
            MerchantOrder mo =
                    new MerchantOrderClient().get(Long.parseLong(paymentEventId));

            mo.getPayments().forEach(pmo -> {
                try {
                    PaymentClient pc = new PaymentClient();
                    Payment payment = pc.get(pmo.getId());
                    actualizarPago(payment, rawJson);
                } catch (Exception ignored) {}
            });

        } catch (Exception e) {
            System.out.println("❌ Error procesando Payment directo: " + e.getMessage());
        }
    }



    private void procesarMerchantOrder(String merchantOrderId, String rawJson) {
        System.out.println("📦 Procesando MERCHANT_ORDER=" + merchantOrderId);
        try {
            MerchantOrderClient client = new MerchantOrderClient();
            MerchantOrder mo = client.get(Long.parseLong(merchantOrderId));
            PaymentClient pc = new PaymentClient();

            mo.getPayments().forEach(pagoMp -> {
                try {
                    Payment fullPayment = pc.get(pagoMp.getId());
                    actualizarPago(fullPayment, rawJson);
                } catch (Exception e) {
                    System.out.println("❌ Error obteniendo Payment completo: " + e.getMessage());
                }
            });

        } catch (Exception e) {
            throw new RuntimeException("Error procesando MerchantOrder", e);
        }
    }


    private void actualizarPago(Payment payment, String rawJson) {

        String orderId = payment.getExternalReference(); // 👍 viene directo del POST
        if (orderId == null) {
            System.out.println("❌ No hay external_reference en el pago");
            return;
        }

        PagoEntity pago = pagoRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado para orderId=" + orderId));

        System.out.println("📝 Actualizando pago — Order=" + orderId + " Status=" + payment.getStatus());

        pago.setPaymentId(String.valueOf(payment.getId()));
        pago.setStatus(payment.getStatus());
        pago.setStatusDetail(payment.getStatusDetail());
        pago.setPaymentMethod(payment.getPaymentMethodId());
        pago.setPayerEmail(payment.getPayer().getEmail());
        pago.setUpdatedAt(LocalDateTime.now());
        pago.setRawNotificationJson(rawJson);

        if ("approved".equalsIgnoreCase(payment.getStatus())) {
            pago.setDateApproved(LocalDateTime.now());
            actualizarOrden(orderId, "CONFIRMADA");
        }

        if ("rejected".equalsIgnoreCase(payment.getStatus())) {
            actualizarOrden(orderId, "RECHAZADA");
        }

        pagoRepo.save(pago);
    }


    private void actualizarOrden(String orderId, String nuevoEstado) {
        ordenRepo.findById(Long.parseLong(orderId)).ifPresent(orden -> {
            orden.setEstado(nuevoEstado);
            ordenRepo.save(orden);
        });
    }

    @Override
    public PagoStatusResponse getStatusByOrderId(String orderId) {
        PagoEntity pago = pagoRepo.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Pago no encontrado"));

        return new PagoStatusResponse(
                pago.getOrderId(),
                pago.getPreferenceId(),
                pago.getPaymentId(),
                pago.getStatus(),
                pago.getStatusDetail(),
                pago.getPaymentMethod(),
                pago.getAmount()
        );
    }
}

