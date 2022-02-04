import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter((it) => {
      return (
        it.name.toLowerCase().includes(searchText.toLowerCase()) ||
        it.address.toLowerCase().includes(searchText.toLowerCase()) ||
        it.email.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }
}
