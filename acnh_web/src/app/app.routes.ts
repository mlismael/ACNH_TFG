import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { VillagersComponent } from './components/villagers/villagers.component';
import { BugsComponent } from './components/bugs/bugs.component';
import { FishComponent } from './components/fish/fish.component';
import { SeaCreaturesComponent } from './components/sea-creatures/sea-creatures.component';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'villagers', component: VillagersComponent},
    {path: 'bugs', component: BugsComponent},
    {path: 'fishes', component: FishComponent},
    {path: 'seacreatures', component: SeaCreaturesComponent},

];
