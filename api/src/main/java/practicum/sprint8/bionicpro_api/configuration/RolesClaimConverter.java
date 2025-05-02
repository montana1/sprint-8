package practicum.sprint8.bionicpro_api.configuration;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class RolesClaimConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtGrantedAuthoritiesConverter wrappedConverter = new JwtGrantedAuthoritiesConverter();

    private final RolesExtractor rolesExtractor;

    @Override
    public AbstractAuthenticationToken convert(@NotNull Jwt jwt) {
        // get authorities from wrapped converter
        var grantedAuthorities = new ArrayList<>(wrappedConverter.convert(jwt));
        // get role authorities
        rolesExtractor.extract(jwt, grantedAuthorities);

        return new JwtAuthenticationToken(jwt, grantedAuthorities);
    }
}
