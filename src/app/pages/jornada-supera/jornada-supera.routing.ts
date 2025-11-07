import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JornadaSuperaComponent } from './jornada-supera.component';
const routes: Routes = [
  { path: '', component: JornadaSuperaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JornadaSuperaRoutingModule { }
