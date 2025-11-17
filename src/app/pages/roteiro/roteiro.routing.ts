import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { FeriadoComponent } from './feriado/feriado.component';


const routes: Routes = [
    {
        path: '', component: ListComponent, children: [
            { path: 'cadastrar', component: FormComponent },
            { path: 'editar/:id', component: FormComponent },
            { path: 'feriado', component: FeriadoComponent },
            { path: 'feriado/:id', component: FeriadoComponent },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RoteiroRoutingModule { }
