// dashboard.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Shared components
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FooterComponent } from "../../shared/footer/footer.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  displayedColumns: string[] = ['product', 'stock', 'action'];
  lowStockItems = ([
    { name: 'Écrans LED 24"', category: 'Informatique', stock: 5, stockPercent: 15 },
    { name: 'Souris Sans Fil', category: 'Périphériques', stock: 3, stockPercent: 10 },
    { name: 'Claviers Mécaniques', category: 'Périphériques', stock: 7, stockPercent: 20 },
    { name: 'Disques Durs SSD', category: 'Composants', stock: 4, stockPercent: 12 },
    { name: 'Cartes Graphiques', category: 'Composants', stock: 2, stockPercent: 5 }
  ]);
}