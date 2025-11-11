package com.example.LautaroDieselEcommerce.config;

import com.mercadopago.MercadoPagoConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class MercadoPagoInitializer {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        // ⚠️ Ahora sí, estamos llamando al SDK real, no a nuestra clase
        MercadoPagoConfig.setAccessToken(accessToken);
    }
}
