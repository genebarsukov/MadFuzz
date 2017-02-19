import { Component } from '@angular/core';
import {StoryDataService} from "../../services/story-data.service";
import {Subscription} from 'rxjs/Subscription';
import {Story} from "../../models/story";

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  //templateUrl: 'app/components/app/app.component.html',
  //styleUrls: ['app/components/app/app.component.css']
})
export class AppComponent {
  name = 'MadFuzz';
  user_id_changed_subscription: Subscription;
  story_subscription: Subscription;
  user_id: number;

  /**
   * Injecting our story data service into this component
   */
  constructor(private story_data_service: StoryDataService) {
    // subscribe to get the user id from another component when it is available
    this.user_id_changed_subscription = this.story_data_service.getUserId().subscribe(
        user_id => this.updateUserId(user_id)
    );
  }

  /**
   * Update child subscriber's user id
   * @param user_id
   */
  updateUserId(user_id: number) {
    this.user_id = user_id;
    this.story_data_service.changeUserId(user_id);
  }

  /**
   * Reload all stories on header logo click
   */
  reloadAllStories() {
    this.story_subscription = this.story_data_service.getStories(this.user_id).subscribe(
        all_stories => this.processAllStories(all_stories)
    );
  }

  /**
   * Update  our story objects with the new data
   * @param all_stories
     */
  processAllStories(all_stories: Story[]) {
    this.story_data_service.changeSources(all_stories);
  }

  /**
   * Called when the component is destroyed. Used to dispose of data subscriptions to avoid memoty leaks
   */
  ngOnDestroy() {
  // Unsubscribe from the data service when this module is destroyed
    if (this.user_id_changed_subscription != null) { this.user_id_changed_subscription.unsubscribe(); }
    if (this.story_subscription != null) { this.story_subscription.unsubscribe(); }
  }

}
  