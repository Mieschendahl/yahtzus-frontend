import { Routes } from '@angular/router';
import { MainPage } from './pages/main/main';
import { PlayPage } from './pages/play/play';

export const routes: Routes = [
    {
        path: '',
        component: MainPage
    },
    {
        path: 'play',
        component: PlayPage
    }
];
