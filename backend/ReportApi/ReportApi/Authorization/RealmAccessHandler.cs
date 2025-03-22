using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace ReportApi.Authorization;

public class RealmAccessHandler : AuthorizationHandler<RealmAccessRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RealmAccessRequirement requirement)
    {
        var realmAccessClaim = context.User.Claims.FirstOrDefault(c => c.Type == "realm_access");

        if (realmAccessClaim == null)
        {
            return Task.CompletedTask;
        }

        try
        {
            var realmAccess = JsonSerializer.Deserialize<Dictionary<string, string[]>>(realmAccessClaim.Value);
            if (realmAccess != null && realmAccess.TryGetValue("roles", out var roles))
            {
                if (roles.Contains(requirement.RequiredRole))
                {
                    context.Succeed(requirement);
                }
            }
        }
        catch (JsonException)
        {
            // Ошибка при десериализации JSON
            return Task.CompletedTask;
        }

        return Task.CompletedTask;
    }
} 