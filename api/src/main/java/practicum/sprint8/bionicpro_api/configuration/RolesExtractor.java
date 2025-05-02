package practicum.sprint8.bionicpro_api.configuration;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;

public interface RolesExtractor {
    public void extract(Jwt jwt, Collection<GrantedAuthority> grantedAuthorities);
}
