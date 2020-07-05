using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Services.Classes
{
    public class UserResolverService
    {
        private readonly IHttpContextAccessor context;

        public UserResolverService(IHttpContextAccessor context)
        {
            this.context = context;
        }
        public String GetUser() {
            return  context.HttpContext.User?.Identity?.Name;
        }
    }
}
