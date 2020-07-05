using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Model.ViewModels
{
    public class RegisterVM
    {
        public int ID { get; set; }

        [RegularExpression("^[a-zA-Z0-9_\\.-]+@([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$", ErrorMessage = "invalid E-Mail")]
        [Required(ErrorMessage = " Email is required")]
        [Display(Name = "E-mail")]
        public String Email { get; set; }

        [Required(ErrorMessage = "please enter your password")]
        [RegularExpression("^((?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])|(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^a-zA-Z0-9])|(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[^a-zA-Z0-9])|(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^a-zA-Z0-9])).{8,}$", ErrorMessage = "password must be at least 8 chractersand contain 3 of 4 of the following:upper case letter , lower case letter number,and a special character")]
        public String Password { get; set; }

        [Required(ErrorMessage = "Please confirm your password")]
        [Compare("Password", ErrorMessage = "Password & password confirmation must be the same")]
        public String ConfirmPassword { get; set; }

        [StringLength(maximumLength: 20, MinimumLength = 3)]
        public String UserName { get; set; }

        public IFormFile ImageUrl { get; set; }

        [Required]
        public String Role { get; set; }
    }
}
