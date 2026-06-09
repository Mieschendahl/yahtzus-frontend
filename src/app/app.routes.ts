import { Routes } from '@angular/router';
import { Main } from './pages/main/main';
import { Play } from './pages/play/play';

export const routes: Routes = [
    {
        path: '',
        component: Main
    },
    {
        path: 'play',
        component: Play
    }
];
