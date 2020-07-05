using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Model
{
    public class Conversation
    {
        //props
        public int ID { get; set; }
        [ForeignKey("User1")]
        public int user1_ID { get; set; }
        [ForeignKey("User2")]
        public int User2_ID { get; set; }

        //relations
        public virtual User User1 { get; set; }
        public virtual User User2 { get; set; }

    }
}
