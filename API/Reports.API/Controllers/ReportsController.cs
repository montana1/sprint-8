using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Reports.API.Controllers;

[Controller]
[Authorize(Roles = "prothetic_user")]
public class ReportsController : ControllerBase
{
    [HttpGet("reports")]
    public string GetReports()
    {
        return "отчет готов!";
    }
}
