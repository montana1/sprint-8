using Microsoft.AspNetCore.Authorization;

namespace ReportApi.Authorization;

public class RealmAccessRequirement : IAuthorizationRequirement
{
    public string RequiredRole { get; }

    public RealmAccessRequirement(string requiredRole)
    {
        RequiredRole = requiredRole;
    }
} 