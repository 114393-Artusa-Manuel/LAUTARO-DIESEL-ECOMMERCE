package com.example.LautaroDieselEcommerce.controller.pago;

import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoFullDto;
import com.example.LautaroDieselEcommerce.entity.pago.PagoEntity;
import com.example.LautaroDieselEcommerce.repository.pago.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository pagoRepository;

    @GetMapping
    public ResponseEntity<BaseResponse<List<PagoFullDto>>> getAllPayments() {
        List<PagoEntity> pagos = pagoRepository.findAll();
        List<PagoFullDto> dtos = pagos.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK)
                .body(new BaseResponse<>("Listado de pagos", HttpStatus.OK.value(), dtos));
    }

    private PagoFullDto toDto(PagoEntity e) {
        return PagoFullDto.builder()
                .id(e.getId())
                .orderId(e.getOrderId())
                .preferenceId(e.getPreferenceId())
                .paymentId(e.getPaymentId())
                .status(e.getStatus())
                .statusDetail(e.getStatusDetail())
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .payerEmail(e.getPayerEmail())
                .paymentMethod(e.getPaymentMethod())
                .dateCreated(e.getDateCreated())
                .dateApproved(e.getDateApproved())
                .updatedAt(e.getUpdatedAt())
                .rawNotificationJson(e.getRawNotificationJson())
                .build();
    }
}
