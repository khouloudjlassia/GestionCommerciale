using GestionCommerciale.Api.DTOs;

namespace GestionCommerciale.Api.Services;

public interface IOrderService
{
    Task<List<OrderDto>> GetAllAsync();
    Task<OrderDto> GetByIdAsync(int id);
    Task<OrderDto> CreateAsync(OrderCreateDto dto);
    Task<OrderDto> UpdateAsync(int id, OrderCreateDto dto);
    Task<OrderDto> ValidateAsync(int id);
    Task DeleteAsync(int id);
    Task<OrderDto> CancelAsync(int id);
}