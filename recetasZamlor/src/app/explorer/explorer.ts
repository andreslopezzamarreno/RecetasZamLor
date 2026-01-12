import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- IMPORTANTE

interface GithubItem {
  name: string;
  type: 'file' | 'dir';
  path: string;
  download_url: string;
}

@Component({
  selector: 'app-root',
  standalone: true,          // asegúrate de que sea standalone
  imports: [RouterOutlet, CommonModule], // <-- agregar CommonModule
  templateUrl: './explorer.html',
  styleUrls: ['./explorer.css'],  // corregido a styleUrls
})
export class ExplorerComponent {
  title = signal('Explorador GitHub');
  files = signal<GithubItem[]>([]);
  loading = signal(false);
  fileContent = signal<string | null>(null);
  currentFile = signal<string | null>(null);

  OWNER = 'andreslopezzamarreno';
  REPO = 'Recetas';

  constructor(private router: Router) {
    this.loadRepo();
  }

  async loadRepo(path: string = '') {
    this.loading.set(true);
    this.fileContent.set(null);

    const url = `https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${path}`;
    const res = await fetch(url);
    const data = await res.json();

    this.files.set(data);
    this.loading.set(false);
  }

  cleanName(name: string) {
    return name.replace(/\.[^/.]+$/, '');
  }

  openFile(item: GithubItem) {
    const encodedPath = encodeURIComponent(item.path);
    this.router.navigate(['/file', this.OWNER, this.REPO, encodedPath]);
  }

  openFolder(item: GithubItem) {
    if (item.type === 'dir') {
      this.loadRepo(item.path);
    }
  }
}
