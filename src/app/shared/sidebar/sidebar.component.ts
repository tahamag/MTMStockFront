// sidebar.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subscription, filter } from 'rxjs';

interface NavItem {
  icon: string;
  label: string;
  route?: string;
  isActive: boolean;
  children?: NavItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  private router = inject(Router);
  private routerSubscription!: Subscription;

  navItems = signal<NavItem[]>([
    {
      icon: 'dashboard',
      label: 'Tableau de Bord',
      route: '/dashboard',
      isActive: true,
      isExpanded: false
    },
    {
      icon: 'inventory_2',
      label: 'Gestion de Stock',
      isActive: false,
      isExpanded: false,
      children: [
        { icon: 'layers', label: 'Tous les Produits', route: '/article', isActive: false },
        { icon: 'category', label: 'Catégories', route: '/categorie', isActive: false },
        { icon: 'warehouse', label: 'Dépôts', route: '/depot', isActive: false },
       // { icon: 'inventory', label: 'Inventaire', route: '/stock/inventory', isActive: false },
        //{ icon: 'compare_arrows', label: 'Transferts', route: '/stock/transfers', isActive: false }
      ]
    },
    {
      icon: 'people',
      label: 'Clients',
      isActive: false,
      isExpanded: false,
      children: [
        { icon: 'group', label: 'Liste des Clients', route: '/client', isActive: false },
        { icon: 'person_add', label: 'Nouveau Client', route: '/clients/new', isActive: false },
        { icon: 'loyalty', label: 'Programme Fidélité', route: '/clients/loyalty', isActive: false },
        { icon: 'history', label: 'Historique', route: '/clients/history', isActive: false }
      ]
    },
    {
      icon: 'local_shipping',
      label: 'Fournisseurs',
      isActive: false,
      isExpanded: false,
      children: [
        { icon: 'business', label: 'Liste des Fournisseurs', route: '/fournisseur', isActive: false },
        { icon: 'add_business', label: 'Nouveau Fournisseur', route: '/suppliers/new', isActive: false },
        { icon: 'receipt', label: 'Commandes', route: '/suppliers/orders', isActive: false },
        { icon: 'local_shipping', label: 'Livraisons', route: '/suppliers/deliveries', isActive: false }
      ]
    },
    {
      icon: 'shopping_cart',
      label: 'Ventes',
      isActive: false,
      isExpanded: false,
      children: [
        { icon: 'receipt_long', label: 'Commandes', route: '/commandeClient', isActive: false },
        { icon: 'point_of_sale', label: 'Point de Vente', route: '/BonLivraison', isActive: false },
        { icon: 'Facture', label: 'Facture', route: '/factureClient', isActive: false },
        { icon: 'assignment_return', label: 'Retours', route: '/sales/returns', isActive: false }
      ]
    },
    {
      icon: 'shopping_cart',
      label: 'Achats',
      isActive: false,
      isExpanded: false,
      children: [
        { icon: 'receipt_long', label: 'commande', route: '/commandeFournisseur', isActive: false },
        { icon: 'payment', label: 'Bon Reception', route: '/BonReception', isActive: false },
        { icon: 'payment', label: 'Facture', route: '/FactureFournisseur', isActive: false },
      ]
    },
    {
      icon: 'assessment',
      label: 'Rapports',
      isActive: false,
      isExpanded: false,
      children: [
        { icon: 'bar_chart', label: 'Ventes', route: '/reports/sales', isActive: false },
        { icon: 'trending_up', label: 'Performance', route: '/reports/performance', isActive: false },
        { icon: 'inventory_2', label: 'Stock', route: '/reports/stock', isActive: false },
        { icon: 'people', label: 'Clients', route: '/reports/clients', isActive: false },
        { icon: 'description', label: 'Rapports Personnalisés', route: '/reports/custom', isActive: false }
      ]
    },
    {
      icon: 'settings',
      label: 'Paramètres',
      isActive: false,
      isExpanded: false,
      children: [
        { icon: 'person', label: 'Utilisateurs', route: '/utilisateurx    ', isActive: false },
        { icon: 'store', label: 'Boutique', route: '/settings/store', isActive: false },
        { icon: 'receipt', label: 'Facturation', route: '/settings/billing', isActive: false },
        { icon: 'notifications', label: 'Notifications', route: '/settings/notifications', isActive: false },
        { icon: 'security', label: 'Sécurité', route: '/settings/security', isActive: false }
      ]
    }
  ]);

  toggleItem(selectedItem: NavItem): void {
    if (selectedItem.children) {
      // Toggle expansion for items with children
      this.navItems.update(items =>
        items.map(item => ({
          ...item,
          isExpanded: item.label === selectedItem.label ? !item.isExpanded : item.isExpanded,
          isActive: item.label === selectedItem.label
        }))
      );
    } else {
      // Select regular items without children
      this.navItems.update(items =>
        items.map(item => ({
          ...item,
          isActive: item.label === selectedItem.label,
          isExpanded: item.isExpanded // Keep expansion state
        }))
      );
    }
  }

  selectChildItem(parentLabel: string, childItem: NavItem): void {
    this.navItems.update(items =>
      items.map(item => {
        if (item.label === parentLabel) {
          return {
            ...item,
            isActive: true,
            children: item.children?.map(child => ({
              ...child,
              isActive: child.label === childItem.label
            }))
          };
        }
        return {
          ...item,
          isActive: false
        };
      })
    );
  }
  ngOnInit(): void {
    // Set initial active state based on current route
    this.updateActiveState(this.router.url);

    // Subscribe to route changes
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveState(event.url);
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateActiveState(currentUrl: string): void {
    this.navItems.update(items =>
      items.map(item => this.updateItemActiveState(item, currentUrl))
    );
  }
  private updateItemActiveState(item: NavItem, currentUrl: string): NavItem {
    // Check if this item is active
    const isItemActive = item.route === currentUrl;

    // Check if any child is active
    let isChildActive = false;
    let children: NavItem[] = [];

    if (item.children) {
      children = item.children.map(child => {
        const isChildActive = child.route === currentUrl;
        return { ...child, isActive: isChildActive };
      });
      isChildActive = children.some(child => child.isActive);
    }
    // Update expanded state - expand if item or any child is active
    const shouldExpand = isItemActive || isChildActive;

    return {
      ...item,
      isActive: isItemActive,
      isExpanded: shouldExpand,
      children: children.length > 0 ? children : item.children
    };
  }

}
