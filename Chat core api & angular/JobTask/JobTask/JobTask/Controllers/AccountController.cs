using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JobTask.Model.ViewModels;
using JobTask.Repo.Classes;
using JobTask.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JobTask.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserRepository userRepository;
        private readonly IUserServices userService;

        public AccountController(UserRepository userRepository, IUserServices userService)
        {
            this.userRepository = userRepository;
            this.userService = userService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public IActionResult login(LoginViewModel loginViewModel)
        {

            //loginViewModel.Password = Encrypt.GenerateSha256Hash(loginViewModel.Password);
            var user = userService.Authenticate(loginViewModel.Email, loginViewModel.Password);
            if (user == null)
            {
                return BadRequest(new { message = "Username or password is incorrect " });
            }
            return Ok(user);
        }


        [AllowAnonymous]
        [HttpPost("register")]

        public IActionResult register([FromForm]RegisterVM register)
        {
            if (ModelState.IsValid)
            {
                var mailExists = userRepository.GetByMail(register.Email);
                if (mailExists != null)
                {
                    return BadRequest(new { message = "This Mail is already registered" });
                }
                var user = userService.register(register);
                if (user == null)
                {
                    return BadRequest();
                }

                return Ok(user);
            }
            else return BadRequest(ModelState.Values);
        }

    }
}