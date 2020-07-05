using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Model.ViewModels
{
    public class UserVM
    {
            public int ID { get; set; }
            public String Email { get; set; }
            public String UserName { get; set; }
            public String ImageUrl { get; set; }
            public String Token { get; set; }
            public String Role { get; set; }
            public String Status { get; set; }
            //public String ConnectionId { get; set; }
    }
}
