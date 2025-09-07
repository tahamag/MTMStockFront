// dashboard.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { AuthService } from '../../services/auth/auth.service';
import { ArticleService } from '../../services/article/article.service';
import { Article } from '../../models/article';
import { StockService } from '../../services/stock/stock.service';
import { Stock } from '../../models/stock';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { RouterLink } from "@angular/router";

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
    FooterComponent,
    MatProgressSpinner,
    RouterLink
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private articleService = inject(ArticleService);
    private stockService = inject(StockService);
//  private CategorieService = inject(CategorieService);
  AuthService = inject(AuthService);

  articles = signal<Article[]>([]);
  stock = signal<Stock[]>([]);
  userName = signal('');
  userEmail = signal('');
  TotalArt = signal(0);
  TotalQteFaible = signal(0);
  TotalQteTotal = signal(0);
  isLoading = signal(false);

  getUserNameFromToken(): void {
    const token = this?.AuthService.getToken();

    try {
      const payload = token!.split('.')[1];
      const decoded = atob(payload);
      const parsed = JSON.parse(decoded);
      this.userName.set(parsed?.unique_name || 'Admin User');
      this.userEmail.set(parsed?.email || '');
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }
  
  ngOnInit(): void {
    this.getUserNameFromToken();
    this.loadArticles();
    this.loadStock();
  }

  loadArticles(): void {
    this.isLoading.set(true);
    this.articleService.getArticles().subscribe({
      next: (response) => {
        if (response) {
          this.articles.set(response.slice(0, 5));
          console.log(this.articles());
          this.TotalArt.set(response.length);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
      }
    });
  }
  
  loadStock(): void {
    this.isLoading.set(true);

    this.stockService.getStockBySte().subscribe({
      next: (response) => {
        if (response) {
          this.stock.set(response);
          
          this.stock.set(
            this.stock().filter(stock => {
              const faibleStock = stock.quantiteFinale < 0;
              return faibleStock;
            })
          );
          
          this.TotalQteTotal.set(response.filter(( article: { quantiteFinale: number; }) => article.quantiteFinale >= 0).length);
          this.TotalQteFaible.set(response.filter((article: { quantiteFinale: number; }) => article.quantiteFinale < 0).length);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
      }
    });
  }
}