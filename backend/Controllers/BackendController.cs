using Casualbunker.Server.Common;
using Microsoft.AspNetCore.Mvc;

namespace MetricsController.Controllers
{
    [ApiController]
    public class BackendController : Controller
    {
        [HttpGet("Ping")]
        public string Ping()
        {
            try
            {
                return JsonGeneric.ToJson($"{Environment.MachineName} || {System.Net.Dns.GetHostName()}");
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }

        [HttpGet("reports")]
        public string Reports()
        {
            try
            {
                return "Success";
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }
    }
}