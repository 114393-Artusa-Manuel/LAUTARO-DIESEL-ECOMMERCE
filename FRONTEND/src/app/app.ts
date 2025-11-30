import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './home/home';
import { Navbar } from './navbar/navbar';
import { Toasts } from './toasts/toasts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Navbar,Toasts],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FRONTEND');
}
