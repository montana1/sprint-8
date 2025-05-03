package ru.practicum.backend

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configurers.CorsConfigurer
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import java.util.stream.Collectors


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.oauth2ResourceServer { oauth2 ->
            oauth2.jwt { jwt ->
                jwt.jwtAuthenticationConverter(
                    jwtAuthenticationConverter()
                )
            }
        }
        http.cors { cors: CorsConfigurer<HttpSecurity?> -> cors.configurationSource(corsConfigurationSource()) } // Enable CORS
            .authorizeHttpRequests(Customizer { authorize ->
                authorize
                    .requestMatchers("/report").hasRole("prothetic_user")
                    .anyRequest().permitAll()
            }
            )
        .csrf().disable();
        return http.build()
    }

    @Bean
    fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val jwtAuthenticationConverter = JwtAuthenticationConverter()
        val jwtGrantedAuthoritiesConverter = JwtGrantedAuthoritiesConverter()
        jwtAuthenticationConverter.setPrincipalClaimName("preferred_username")
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter { jwt: Jwt ->
            val roles = jwt.getClaimAsMap("realm_access").get("roles") as List<String>
            val authorities: Collection<GrantedAuthority> = roles.stream()
                .map { role: String? -> SimpleGrantedAuthority("ROLE_$role") }
                .collect(Collectors.toList())
            authorities
        }
        return jwtAuthenticationConverter
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = mutableListOf("http://localhost:3000")
        configuration.allowedMethods = mutableListOf("GET", "POST", "OPTIONS")
        configuration.allowedHeaders = mutableListOf("Authorization", "Content-Type")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}