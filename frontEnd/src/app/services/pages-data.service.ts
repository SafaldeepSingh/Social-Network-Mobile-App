import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagesDataService {
  private activeViewAllImagesData;
  private ViewAllImagesData = [];
  constructor() { }

  getViewAllImagesData() {
    return this.activeViewAllImagesData;
  }
  pushViewAllImagesData(data) {
    this.ViewAllImagesData.push(data);
    this.activeViewAllImagesData = data;
  }
  popViewAllImagesData() {
    this.ViewAllImagesData.pop();
    this.activeViewAllImagesData = this.ViewAllImagesData[this.ViewAllImagesData.length - 1];
  }
}
