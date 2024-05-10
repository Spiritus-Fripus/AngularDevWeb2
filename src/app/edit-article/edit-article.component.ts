import { Article } from './../models/Article.type';
import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatIconModule,
  ],
  templateUrl: './edit-article.component.html',
  styleUrl: './edit-article.component.scss',
})
export class EditArticleComponent implements OnInit {
  filesSelected: File | null = null;
  formBuilder: FormBuilder = inject(FormBuilder);
  http: HttpClient = inject(HttpClient);
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);

  formulaire: FormGroup = this.formBuilder.group({
    nom: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    description: ['', []],
    prix: [1, [Validators.required, Validators.min(0.01)]],
  });

  // identfitiant de l'article (null si on en ajoute)
  id: number | null = null;

  // url de l'image sur la base de donnée
  urlImage: string | null = null;

  // passer à vrai l'orsqu'une image existe sur la bdd , mais que l'utilisateur veut la supprimer
  imgDelete: boolean = false;

  // miniature du fichier qui vient d'être selectionné
  thumbnail: string | null = null;

  ngOnInit() {
    this.route.params.subscribe((paramUrl) => {
      // si le paramètre id existe dans l'URL
      if (paramUrl['id']) {
        // si le paramètre est un nombre
        if (!isNaN(paramUrl['id'])) {
          this.id = paramUrl['id'];

          this.http
            .get<Article>(
              `http://localhost/angular-php/article.php?id=${this.id}`
            )
            .subscribe((article: Article) => {
              this.formulaire.patchValue(article),
                (this.urlImage = article.image);
            });
        } else {
          alert(paramUrl['id'] + " n'est pas un identifiant valide");
        }
      }
    });
  }

  onSubmit() {
    if (this.formulaire.valid) {
      const jwt = localStorage.getItem('jwt');
      if (jwt !== null) {
        const data: FormData = new FormData();

        const article = this.formulaire.value;
        article.imgDelete = this.imgDelete;

        data.append('article', JSON.stringify(article));

        if (this.filesSelected) {
          data.append('image', this.filesSelected);
        }
        const url =
          this.id == null
            ? 'http://localhost/angular-php/add-article.php'
            : `http://localhost/angular-php/modify-article.php?id=${this.id}`;
        // si il n'y a pas d'id dans l'URL (c'est un ajout)
        this.http
          .post(url, data, {
            headers: { Authorization: jwt },
          })
          .subscribe({
            next: (result) => this.router.navigateByUrl('/accueil'),
            error: (result) =>
              alert(
                result.error.message
                  ? result.error.message
                  : 'Erreur inconnue, contactez votre admin'
              ),
          });
      }
    }
  }

  onFilesSelect(event: any) {
    this.filesSelected = event.target.files[0];
    this.urlImage = null;
    // on affecte la valeur null à l'input afin qu'un evenement (change) soit de nouveau lancé,
    //meme si il s'agit du meme fichier (dans le cas ou l'on aurait cliqué sur le bouton supprimer)
    event.target.value = null;

    // on récupère le fichier et on le transforme en url
    if (this.filesSelected != null) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnail = e.target.result;
      };
      reader.readAsDataURL(this.filesSelected);
    }
  }

  onDeleteImg() {
    if (this.urlImage != null) {
      this.imgDelete = true;
    }
    this.urlImage = null;
    this.filesSelected = null;
    this.thumbnail = null;
  }
}
