import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-discovery',
  imports: [RouterLink, FormsModule],
  templateUrl: './discovery.html',
})
export class Discovery {
  route = inject(ActivatedRoute);
  router = inject(Router);
  get view(): string {
    return this.route.snapshot.data['view'] || 'discover';
  }
  ideas = [
    {
      title: 'A simpler skincare routine',
      format: 'Carousel',
      description:
        'Break down the steps in a routine you actually follow. Leave space for your own experience and context.',
    },
    {
      title: 'One ingredient, explained clearly',
      format: 'Reel',
      description:
        'Choose an ingredient you know well. Explain what it is, with reliable sources and your own perspective.',
    },
    {
      title: 'What is on your skincare shelf?',
      format: 'Image',
      description:
        'Introduce one product from your routine and the questions you would ask before choosing it.',
    },
  ];
  index = 0;
  format = 'All formats';
  recency = 'Any time';
  updateFilter = 'All';
  get filtered() {
    return this.ideas.filter((i) => this.format === 'All formats' || i.format === this.format);
  }
  get idea() {
    return this.filtered[this.index];
  }
  next() {
    this.index++;
  }
  discuss(title: string) {
    this.router.navigate(['/chat'], { queryParams: { idea: title } });
  }
}
