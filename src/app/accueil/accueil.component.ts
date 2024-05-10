import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Article } from '../models/Article.type';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss',
})
export class AccueilComponent implements OnInit {
  http: HttpClient = inject(HttpClient);

  listArticles: Article[] = [];

  ngOnInit() {
    this.refreshListArticle();
  }

  refreshListArticle() {
    const jwt = localStorage.getItem('jwt');

    if (jwt != null) {
      this.http
        .get<Article[]>('http://localhost/angular-php/articles.php', {
          headers: { Authorization: jwt },
        })
        .subscribe((resultat: Article[]) => (this.listArticles = resultat));
    } else {
      alert("vous n'êtes pas connecté");
    }
  }

  onDeleteArticle(idArticle?: number) {
    this.http
      .delete('http://localhost/angular-php/delete-article.php?id=' + idArticle)
      .subscribe((result) => this.refreshListArticle());
  }
}
