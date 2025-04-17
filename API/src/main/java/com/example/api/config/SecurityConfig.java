package com.example.api.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


/**
 * @author D.Starikov
 * @since 15.04.2025
 */
@Configuration
public class SecurityConfig {

    private static final String ROLE = "prothetic_user";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(httpRequests -> httpRequests.anyRequest().hasAuthority(ROLE))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(o -> o.jwt(jwt -> jwt.jwtAuthenticationConverter(new KeyCloakConverter())))
                .build();
    }

    public static class KeyCloakConverter implements Converter<Jwt, AbstractAuthenticationToken> {
        @Override
        public AbstractAuthenticationToken convert(Jwt jwt) {
            List<GrantedAuthority> authorities = new ArrayList<>();

            if (jwt.getClaim("realm_access") != null) {
                Map<String, Object> realmAccess = jwt.getClaim("realm_access");
                ObjectMapper mapper = new ObjectMapper();
                List<String> roles = mapper.convertValue(realmAccess.get("roles"), new TypeReference<>() {
                });

                for (var role : roles) {
                    authorities.add(new SimpleGrantedAuthority(role));
                }
            }
            return new JwtAuthenticationToken(jwt, authorities);
        }
    }
}
