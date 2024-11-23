import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PostgresqlWindowComponent } from '../postgresql-window/postgresql-window.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// data from https://github.com/dudeonthehorse/datasets/blob/master/amazon.books.json
import books from "../amazon.books.json";

@Component({
  selector: 'app-home',
  imports: [ CommonModule, PostgresqlWindowComponent, FormsModule ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  title = 'PostgreDocument';
  public query: string;
  constructor(){
    this.query = "select 'Hello world' as message;";
  }
  ngOnInit() {
    (<any>window).contentLoaded();
  }
  generateDefinition() {
    this.query =`
  create table books
  (
    id     SERIAL PRIMARY KEY,
    title  VARCHAR(500) NOT NULL,
    data   JSONB  
  )
    `;
  }
  generateBooksInsert() {
    var query = "";
    for (var book of books)
    {
      var bookData = {
        isbn: book.isbn,
        pageCount: book.pageCount,
        shortDescription: book.shortDescription,
        longDescription: book.longDescription,
        published: book.publishedDate,
        authors: book.authors,
        thumbnail: book.thumbnailUrl
      }
      query += `insert into books (title, data) values ('${this.escape_string(book.title)}', '${this.escape_string(JSON.stringify(bookData))}'  );\n`;
    }
    this.query = query;
  }
  escape_string (str:string): string {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "'":
              return "''"
            default:
                return char;
        }
    });
}
}
