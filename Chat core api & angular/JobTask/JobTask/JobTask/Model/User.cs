using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Model
{
    public class User
    {
        //props
        public int ID { get; set; }
        public String Email { get; set; }
        public String Password { get; set; }
        public String UserName { get; set; }
        public String ImageUrl { get; set; }
        public String ConnectionId { get; set; }
        public String Status { get; set; }
        [ForeignKey("Role")]
        public int Role_id { get; set; }

        //relation
        public virtual Role Role { get; set; }
    }
}
