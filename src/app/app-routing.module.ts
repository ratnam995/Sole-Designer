import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: "", loadChildren: "./login/login.module#LoginModule"
  },
  {
    path: "editor", loadChildren: "./editor/editor.module#EditorModule"
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
