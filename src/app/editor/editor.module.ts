import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { HttpService } from '../shared/services/http-service';

@NgModule({
  imports: [
    CommonModule,
    EditorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [EditorComponent],
  providers:[HttpService]
})
export class EditorModule { }
