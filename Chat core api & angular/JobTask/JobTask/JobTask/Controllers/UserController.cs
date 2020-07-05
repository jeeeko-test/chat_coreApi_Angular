using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JobTask.Model;
using JobTask.Repo.Classes;
using JobTask.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JobTask.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserRepository userRepository;
        private readonly IUserServices userService;

        public UserController(UserRepository userRepository, IUserServices userService)
        {
            this.userRepository = userRepository;
            this.userService = userService;
        }
        [NonAction]

        [AllowAnonymous]
        [HttpPost("authenticate")]
        public IActionResult Authenticate([FromBody]User userParam)
        {
            var user = userService.Authenticate(userParam.Email, userParam.Password);

            if (user == null)
                return BadRequest(new { message = "Username or password is incorrect" });

            return Ok(user);
        }


        //[Authorize(Roles = "Admin")]
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = userRepository.GetAll();
            return Ok(users);
        }

        [Authorize]
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var user = userRepository.GetById(id);

            if (user == null)
            {
                return NotFound();
            }

            // only allow admins to access other user records
            var currentUserId = int.Parse(User.Identity.Name);
            if (id != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            return Ok(user);
        }

    }
}