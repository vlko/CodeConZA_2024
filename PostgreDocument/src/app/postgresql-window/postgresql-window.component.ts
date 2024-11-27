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
  static singleDbInstance:PGlite;
  _db:PGlite;
  public fields:string[];
  public output:string[][];
  public moreResults?: number;
  public error: string[]|null;
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
    if (PostgresqlWindowComponent.singleDbInstance == null)
    {
      PostgresqlWindowComponent.singleDbInstance = new PGlite('idb://codeconza');
    }
    this._db = PostgresqlWindowComponent.singleDbInstance;
  }
  ngOnInit(): void {
    
  }
  clearScreen(): void {
    if (this.query == "") {
      this.output = this.fields = [];
      this.error = null;
      this.moreResults = undefined;
    }
    if (this.output.length > 0 || this.error) {
      this.query = "";
    }

  }
  execQuery(): void {
    this.ExecDB().catch(e => this.error = [e]).finally();
  }
  runQuery(): void {
    this.CallDB().catch(e => this.error = [e]).finally();
  }

  async ExecDB(): Promise<void> {
    this.moreResults = undefined;
    this.output = this.fields = [];
    this.error = [".. executing .."];
    var result = await this._db.exec(this.query);
    var keys = Object.keys(result);
    var output = keys.length > 0 
      ? JSON.stringify(result[result.length - 1])
      : JSON.stringify(result);
    this.output = [ [output] ] 
    this.error = null;
  }

  async CallDB(): Promise<void> {
    this.moreResults = undefined;
    this.output = this.fields = [];
    this.error = [".. loading .."];
    var result = await this._db.query(this.query);
    this.fields = result.fields.map(x => x.name);
    if (this.fields.length == 1 && this.fields[0] == "QUERY PLAN")
    {
      console.log(result);
        this.error = ["Query Plan:", ... result.rows.map(x => (<any>x)["QUERY PLAN"]) ];

    }
    else {
      var maxRows = Math.min(5, result.rows.length)
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
          this.output.push(this.fields.map(x => {
            if ((<any>result.rows[i])[x] instanceof Array) {
              return "[" +(<any>result.rows[i])[x].join(", ") + "]"
            }
            else if ((<any>result.rows[i])[x] instanceof Object) {
              return "[JSON]"
            }
            return (<any>result.rows[i])[x] ?? ""
          }));
        }
        if (maxRows < result.rows.length)
          this.moreResults =  result.rows.length - maxRows;
      }
      this.error = null;
    }
  }

}
