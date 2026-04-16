import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterTasks',
  standalone: true
})
export class FilterTasksPipe implements PipeTransform {
  transform(tasks: any[] | null, status: string): any[] {
    if (!tasks) return [];
    return tasks.filter(task => task.status === status);
  }
}
