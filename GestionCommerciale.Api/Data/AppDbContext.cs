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
public DbSet<Tax> Taxes => Set<Tax>();
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
        modelBuilder.Entity<Tax>(e =>
{
    e.Property(t => t.Libelle).IsRequired().HasMaxLength(100);
    e.Property(t => t.Valeur).HasPrecision(18, 2);

    // Données par défaut pour les tests
    e.HasData(
        new Tax { Id = 1, Libelle = "TVA Standard 19%", Type = TaxType.Percentage, Valeur = 19m, IsActive = true },
        new Tax { Id = 2, Libelle = "TVA Réduite 7%",   Type = TaxType.Percentage, Valeur = 7m,  IsActive = true },
        new Tax { Id = 3, Libelle = "Exonéré (0%)",      Type = TaxType.Percentage, Valeur = 0m,  IsActive = true },
        new Tax { Id = 4, Libelle = "Timbre Fiscal",     Type = TaxType.FixedAmount, Valeur = 1m, IsActive = true }
    );
});

modelBuilder.Entity<Product>(e =>
{
    e.HasOne(p => p.Tax)
     .WithMany(t => t.Products)
     .HasForeignKey(p => p.TaxId)
     .OnDelete(DeleteBehavior.SetNull);
});
    }
}