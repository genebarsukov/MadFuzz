import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent }  from './components/app/app.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { StoryListComponent } from './components/story-list/story-list.component';
import { FlowerPetalComponent } from './components/flower-petal/flower-petal.component';
import { StoryDataService } from './services/story-data.service';

@NgModule({
  imports: [ BrowserModule, FormsModule, HttpModule ],
  declarations: [
    AppComponent,
    SearchBoxComponent,
    StoryListComponent,
    FlowerPetalComponent
    ],
  bootstrap: [ AppComponent ],
  providers: [ StoryDataService ]
})

export class AppModule {}
