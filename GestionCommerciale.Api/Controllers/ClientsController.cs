using GestionCommerciale.Api.DTOs;
using GestionCommerciale.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionCommerciale.Api.Controllers;

[ApiController]
[Route("api/clients")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _service;

    public ClientsController(IClientService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClientDto>>> GetAll() =>
        Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClientDto>> GetById(int id) =>
        Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<ClientDto>> Create(ClientCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClientDto>> Update(int id, ClientCreateDto dto) =>
        Ok(await _service.UpdateAsync(id, dto));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}