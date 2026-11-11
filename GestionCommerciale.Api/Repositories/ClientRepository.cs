using GestionCommerciale.Api.Data;
using GestionCommerciale.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionCommerciale.Api.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly AppDbContext _context;

    public ClientRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<List<Client>> GetAllAsync() =>
        _context.Clients.AsNoTracking().OrderBy(c => c.LastName).ToListAsync();

    public Task<Client?> GetByIdAsync(int id) =>
        _context.Clients.FirstOrDefaultAsync(c => c.Id == id);

    public Task<bool> EmailExistsAsync(string email, int? excludeId = null) =>
        _context.Clients.AnyAsync(c => c.Email == email && c.Id != excludeId);

    public Task<bool> HasOrdersAsync(int id) =>
        _context.Orders.AnyAsync(o => o.ClientId == id);

    public async Task AddAsync(Client client) => await _context.Clients.AddAsync(client);

    public void Remove(Client client) => _context.Clients.Remove(client);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}