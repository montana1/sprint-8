package practicum.sprint8.bionicpro_api.configuration;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Component
public class RolesExtractorImpl implements RolesExtractor {
    @Override
    public void extract(Jwt jwt, Collection<GrantedAuthority> grantedAuthorities) {
//        var roles = (List<String>) jwt.getClaims().get("roles");
        var roles = (List<String>)((Map<String, Object>) jwt.getClaims().get("realm_access")).get("roles");
        if (roles != null) {
            for (String role : roles) {
                grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            }
        }
    }
}
