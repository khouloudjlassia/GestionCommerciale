using GestionCommerciale.Api.DTOs;
using GestionCommerciale.Api.Middleware;
using GestionCommerciale.Api.Models;
using GestionCommerciale.Api.Repositories;

namespace GestionCommerciale.Api.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _repository;

    public ClientService(IClientRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ClientDto>> GetAllAsync()
    {
        var clients = await _repository.GetAllAsync();
        return clients.Select(ToDto).ToList();
    }

    public async Task<ClientDto> GetByIdAsync(int id)
    {
        var client = await GetOrThrowAsync(id);
        return ToDto(client);
    }

    public async Task<ClientDto> CreateAsync(ClientCreateDto dto)
    {
        if (await _repository.EmailExistsAsync(dto.Email))
            throw new ConflictException("Un client avec cet email existe déjà.");

        var client = new Client();
        ApplyDto(client, dto);

        await _repository.AddAsync(client);
        await _repository.SaveChangesAsync();
        return ToDto(client);
    }

    public async Task<ClientDto> UpdateAsync(int id, ClientCreateDto dto)
    {
        var client = await GetOrThrowAsync(id);

        if (await _repository.EmailExistsAsync(dto.Email, id))
            throw new ConflictException("Un autre client utilise déjà cet email.");

        ApplyDto(client, dto);
        await _repository.SaveChangesAsync();
        return ToDto(client);
    }

    public async Task DeleteAsync(int id)
    {
        var client = await GetOrThrowAsync(id);

        if (await _repository.HasOrdersAsync(id))
            throw new BusinessRuleException("Impossible de supprimer un client qui a des commandes.");

        _repository.Remove(client);
        await _repository.SaveChangesAsync();
    }

    private async Task<Client> GetOrThrowAsync(int id) =>
        await _repository.GetByIdAsync(id)
        ?? throw new NotFoundException($"Client {id} introuvable.");

    private static void ApplyDto(Client client, ClientCreateDto dto)
    {
        client.LastName = dto.LastName.Trim();
        client.FirstName = dto.FirstName.Trim();
        client.Email = dto.Email.Trim();
        client.Phone = dto.Phone?.Trim();
        client.Address = dto.Address?.Trim();
    }

    private static ClientDto ToDto(Client c) => new()
    {
        Id = c.Id,
        LastName = c.LastName,
        FirstName = c.FirstName,
        Email = c.Email,
        Phone = c.Phone,
        Address = c.Address,
        CreatedAt = c.CreatedAt
    };
}