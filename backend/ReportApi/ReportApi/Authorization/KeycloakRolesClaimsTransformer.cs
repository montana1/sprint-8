using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;

namespace ReportApi.Authorization;

public class KeycloakRolesClaimsTransformer : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = principal.Identity as ClaimsIdentity;
        var realmAccess = identity?.FindFirst("realm_access");

        if (realmAccess != null)
        {
            var roles = JsonDocument.Parse(realmAccess.Value)
                .RootElement.GetProperty("roles")
                .EnumerateArray()
                .Select(r => r.GetString());

            foreach (var role in roles)
            {
                identity?.AddClaim(new Claim(ClaimTypes.Role, role!));
            }
        }

        return Task.FromResult(principal);
    }
}