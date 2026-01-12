import { Routes } from '@angular/router';
import { ExplorerComponent } from './explorer/explorer';
import { FileViewerComponent } from './file-viewer/file-viewer';

export const routes: Routes = [
  { path: '', component: ExplorerComponent },
  { path: 'file/:owner/:repo/:path', component: FileViewerComponent },
];
