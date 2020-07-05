using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Model.ViewModels
{
    public class ContactsVm
    {
        public int ContactID { get; set; }
        public String ImageUrl { get; set; }
        public String UserName { get; set; }
        public String LastMessage { get; set; }
        public String ConnectionId { get; set; }
        public String Status { get; set; }
    }
}
