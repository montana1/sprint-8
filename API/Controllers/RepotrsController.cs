using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   // [Authorize] // Требуем аутентификации
    public class ReportsController : ControllerBase
    {
        // GET: api/reports
        [HttpGet]
        public ActionResult<IEnumerable<Report>> GetReports()
        {
            if (!User.IsInRole("prothetic_user"))
            {
                return Forbid(); // 403 Forbidden, если у пользователя нет роли
            }

            // Генерация произвольных данных
            var reports = new List<Report>
            {
                new Report { Id = 1, Title = "Monthly Sales Report", Content = "Sales increased by 10% this month." },
                new Report { Id = 2, Title = "Quarterly Financial Report", Content = "Revenue reached $1M this quarter." },
                new Report { Id = 3, Title = "Annual Performance Report", Content = "Company achieved all goals for the year." }
            };

            return Ok(reports);
        }
    }

    // Модель отчета
    public class Report
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
    }
}