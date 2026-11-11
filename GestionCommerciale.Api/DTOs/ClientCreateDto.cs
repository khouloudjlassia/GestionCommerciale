using System.ComponentModel.DataAnnotations;

namespace GestionCommerciale.Api.DTOs;

public class ClientCreateDto
{
    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [StringLength(30)]
    public string? Phone { get; set; }

    [StringLength(250)]
    public string? Address { get; set; }
}