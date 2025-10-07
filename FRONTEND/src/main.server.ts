import 'zone.js/node'; // <-- agregar primero
import { bootstrapApplication, type BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes';

export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(
    App,
    {
      providers: [
        provideServerRendering(),
        provideRouter(routes),
        provideHttpClient(),
      ],
    },
    context
  );
}
