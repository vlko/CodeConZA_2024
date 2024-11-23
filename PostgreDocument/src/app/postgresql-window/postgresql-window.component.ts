import { CodeEditor } from '@acrodata/code-editor';
import { languages } from '@codemirror/language-data';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PGlite } from "@electric-sql/pglite";


@Component({
  selector: 'app-postgresql-window',
  imports: [CommonModule, FormsModule, CodeEditor],
  templateUrl: './postgresql-window.component.html',
  styleUrl: './postgresql-window.component.css'
})
export class PostgresqlWindowComponent implements OnInit {
  _db:PGlite;
  public fields:string[];
  public output:string[][];
  public error: string|null;
  @Input() query: string;
  public options: any = {
    language: 'PostgreSQL',
    placeholder: 'sql goes here...',
  };
  public languages = languages;
  constructor(){
    this.error = null;
    this.query= " ";
    this.output = this.fields = [];
    this._db = new PGlite('idb://codeconza');
  }
  ngOnInit(): void {
    
  }
  execQuery(): void {
    this.ExecDB().catch(e => this.error = e).finally();
  }
  runQuery(): void {
    this.CallDB().catch(e => this.error = e).finally();
  }

  async ExecDB(): Promise<void> {
    this.output = this.fields = [];
    this.error = null;
    var result = await this._db.exec(this.query);
    var keys = Object.keys(result);
    var output = keys.length > 0 
      ? JSON.stringify(result[result.length - 1])
      : JSON.stringify(result);
    this.output = [ [output] ] 
  }

  async CallDB(): Promise<void> {
    this.output = this.fields = [];
    this.error = null;
    var result = await this._db.query(this.query);
    this.fields = result.fields.map(x => x.name);
    var maxRows = Math.min(6, result.rows.length)
    if (maxRows == 0) {
      if (result.affectedRows) {
        this.output = [ ["Affected rows:" + result.affectedRows] ];
      }
      else {
        this.output = [ ["No results!"] ];
      }
    }
    else {
      for (var i = 0; i <maxRows; i++) {
        this.output.push(this.fields.map(x => (<any>result.rows[i])[x] ?? ""));
      }
    }
  }

}
