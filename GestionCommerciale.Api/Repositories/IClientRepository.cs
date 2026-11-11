using GestionCommerciale.Api.Models;

namespace GestionCommerciale.Api.Repositories;

public interface IClientRepository
{
    Task<List<Client>> GetAllAsync();
    Task<Client?> GetByIdAsync(int id);
    Task<bool> EmailExistsAsync(string email, int? excludeId = null);
    Task<bool> HasOrdersAsync(int id);
    Task AddAsync(Client client);
    Task SaveChangesAsync();
    void Remove(Client client);
}