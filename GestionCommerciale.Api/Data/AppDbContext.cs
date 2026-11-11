using GestionCommerciale.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionCommerciale.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Client>(e =>
        {
            e.Property(c => c.LastName).IsRequired().HasMaxLength(100);
            e.Property(c => c.FirstName).IsRequired().HasMaxLength(100);
            e.Property(c => c.Email).IsRequired().HasMaxLength(150);
            e.Property(c => c.Phone).HasMaxLength(30);
            e.Property(c => c.Address).HasMaxLength(250);
            e.HasIndex(c => c.Email).IsUnique();
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.Reference).IsRequired().HasMaxLength(50);
            e.Property(p => p.Name).IsRequired().HasMaxLength(150);
            e.Property(p => p.Description).HasMaxLength(500);
            e.Property(p => p.UnitPriceHT).HasPrecision(18, 2);
            e.HasIndex(p => p.Reference).IsUnique();
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.Property(o => o.OrderNumber).IsRequired().HasMaxLength(30);
            e.Property(o => o.TotalHT).HasPrecision(18, 2);
            e.Property(o => o.TotalTTC).HasPrecision(18, 2);
            e.HasIndex(o => o.OrderNumber).IsUnique();

            // Un client a plusieurs commandes : on bloque la suppression d'un client qui a des commandes
            e.HasOne(o => o.Client)
             .WithMany(c => c.Orders)
             .HasForeignKey(o => o.ClientId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderLine>(e =>
        {
            e.Property(l => l.UnitPrice).HasPrecision(18, 2);
            e.Property(l => l.LineTotal).HasPrecision(18, 2);

            // Supprimer une commande supprime ses lignes
            e.HasOne(l => l.Order)
             .WithMany(o => o.Lines)
             .HasForeignKey(l => l.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            // On bloque la suppression d'un produit déjà commandé
            e.HasOne(l => l.Product)
             .WithMany(p => p.OrderLines)
             .HasForeignKey(l => l.ProductId)
             .OnDelete(DeleteBehavior.Restrict);

            e.ToTable(t => t.HasCheckConstraint("CK_OrderLines_Quantity", "[Quantity] > 0"));
        });
    }
}