using GestionCommerciale.Api.DTOs;
using GestionCommerciale.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionCommerciale.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;

    public OrdersController(IOrderService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetAll() =>
        Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetById(int id) =>
        Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(OrderCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<OrderDto>> Update(int id, OrderCreateDto dto) =>
        Ok(await _service.UpdateAsync(id, dto));

    [HttpPost("{id:int}/validate")]
    public async Task<ActionResult<OrderDto>> Validate(int id) =>
        Ok(await _service.ValidateAsync(id));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}