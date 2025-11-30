package com.example.LautaroDieselEcommerce.controller.report;

import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.report.TopItemDto;
import com.example.LautaroDieselEcommerce.repository.orden.ItemOrdenRepository;
import com.example.LautaroDieselEcommerce.repository.imagen.ImagenProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ItemOrdenRepository itemOrdenRepository;
    private final ImagenProductoRepository imagenProductoRepository;

    @GetMapping("/top-items")
    public ResponseEntity<BaseResponse<List<TopItemDto>>> getTopItems(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit
    ) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        List<TopItemDto> results = itemOrdenRepository.findTopItemsBetween(start, end);
        if (results == null || results.isEmpty()) {
            return ResponseEntity.ok(new BaseResponse<>("No se encontraron items en el rango", HttpStatus.OK.value(), List.of()));
        }

        // Enrich results with first image URL for each product (if available)
        results.forEach(dto -> {
            try {
                var imgs = imagenProductoRepository.findByProducto_IdProductoOrderByOrdenAsc(dto.getIdProducto());
                if (imgs != null && !imgs.isEmpty()) dto.setImageUrl(imgs.get(0).getUrl());
            } catch (Exception ignored) { }
        });

        List<TopItemDto> truncated = results.stream().limit(limit).collect(Collectors.toList());
        return ResponseEntity.ok(new BaseResponse<>("Top items", HttpStatus.OK.value(), truncated));
    }
}
