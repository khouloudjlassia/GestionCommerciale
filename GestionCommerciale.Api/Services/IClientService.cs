using GestionCommerciale.Api.DTOs;

namespace GestionCommerciale.Api.Services;

public interface IClientService
{
    Task<List<ClientDto>> GetAllAsync();
    Task<ClientDto> GetByIdAsync(int id);
    Task<ClientDto> CreateAsync(ClientCreateDto dto);
    Task<ClientDto> UpdateAsync(int id, ClientCreateDto dto);
    Task DeleteAsync(int id);
}