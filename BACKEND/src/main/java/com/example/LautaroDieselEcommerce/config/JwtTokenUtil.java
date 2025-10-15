package com.example.LautaroDieselEcommerce.config;

import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtTokenUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(UsuarioEntity usuario) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());

        return Jwts.builder()
                .setSubject(usuario.getCorreo())
                .claim("roles", usuario.getRoles())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Parsea el token JWT y devuelve la lista de nombres de roles (String).
     * Si el token es inválido, lanza JwtException.
     */
    public List<String> getRolesFromToken(String token) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Object rolesObj = claims.get("roles");
        if (rolesObj == null) return List.of();

        // rolesObj normalmente será una lista de maps (RoleEntity serialized)
        // convertimos a sus nombres si es posible
        try {
            @SuppressWarnings("unchecked")
            List<Object> rolesList = (List<Object>) rolesObj;
            return rolesList.stream()
                    .map(r -> {
                        if (r == null) return null;
                        // si es un map con campo "nombre"
                        try {
                            java.util.Map<String, Object> map = (java.util.Map<String, Object>) r;
                            Object nombre = map.get("nombre");
                            return nombre != null ? nombre.toString() : null;
                        } catch (ClassCastException ex) {
                            return r.toString();
                        }
                    })
                    .filter(java.util.Objects::nonNull)
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
        } catch (ClassCastException ex) {
            // fallback: single string
            return List.of(rolesObj.toString().toLowerCase());
        }
    }
}
