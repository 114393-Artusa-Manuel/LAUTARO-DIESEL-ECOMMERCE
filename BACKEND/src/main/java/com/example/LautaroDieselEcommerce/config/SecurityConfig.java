package com.example.LautaroDieselEcommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Autorización: por defecto permite  (para no bloquear endpoints al principio)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                // Deshabilitamos CSRF si solo usás API REST
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
