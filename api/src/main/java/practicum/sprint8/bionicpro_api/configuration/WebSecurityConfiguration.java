package practicum.sprint8.bionicpro_api.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfiguration {
    @Autowired
    RolesClaimConverter rolesClaimConverter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/main").permitAll()
                        .requestMatchers("/report").hasRole("prothetic_user")
                );
        http.oauth2ResourceServer(resourceServer -> resourceServer
                .jwt()
                .jwtAuthenticationConverter(rolesClaimConverter)
        );
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri("http://keycloak:8080/realms/reports-realm/protocol/openid-connect/certs").build();
//        return NimbusJwtDecoder.withJwkSetUri("http://localhost:8080/realms/reports-realm/protocol/openid-connect/certs").build();
    }

}
