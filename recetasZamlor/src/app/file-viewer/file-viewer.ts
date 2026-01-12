import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [RouterModule, CommonModule, NgFor, NgIf],
  templateUrl: './file-viewer.html',
  styleUrl: './file-viewer.css'
})
export class FileViewerComponent {
  rawContent = signal<string>('Cargando...');
  filePath = signal<string>('');
  owner = '';
  repo = '';

  title = signal<string>('');
  sections = signal<{ subtitle: string; lines: string[] }[]>([]);

  constructor(private route: ActivatedRoute) {
    this.loadFile();
  }

  async loadFile() {
    this.owner = this.route.snapshot.paramMap.get('owner')!;
    this.repo = this.route.snapshot.paramMap.get('repo')!;
    const path = this.route.snapshot.paramMap.get('path')!;
    this.filePath.set(path);

    const url = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/${path}`;
    const res = await fetch(url);
    const text = await res.text();
    this.rawContent.set(text);

    this.parseMarkdown(text);
  }

  parseMarkdown(md: string) {
    const lines = md.split('\n');
    let titleStr = '';
    const sectionsArr: { subtitle: string; lines: string[] }[] = [];
    let currentSection: { subtitle: string; lines: string[] } | null = null;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('# ')) {
        titleStr = line.replace('# ', '');
      } else if (line.startsWith('## ')) {
        // Nuevo subtítulo
        currentSection = { subtitle: line.replace('## ', ''), lines: [] };
        sectionsArr.push(currentSection);
      } else {
        if (currentSection) {
          // Limpieza de viñetas tipo "· "
          currentSection.lines.push(line.replace(/^·\s*/, ''));
        }
      }
    }

    this.title.set(titleStr);
    this.sections.set(sectionsArr);
  }
}
