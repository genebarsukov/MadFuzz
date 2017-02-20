import {Component, OnDestroy, trigger, state, style, transition, animate, keyframes} from '@angular/core';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import {StoryDataService} from '../../services/story-data.service';
import {Story} from "../../models/story";
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'story-list',
    templateUrl: './story-list.component.html',
    styleUrls: ['./story-list.component.css'],
    //templateUrl: 'app/components/story-list/story-list.component.html',
    //styleUrls: ['app/components/story-list/story-list.component.css'],
    animations: [
        trigger('story_state', [
            state('expanded', style({
                height: '100px'
            })),
            state('collapsed',   style({
                height: '0px',
            })),
            transition('collapsed => expanded', [
                animate(500, style({height: '100px' }))
            ]),
            transition('expanded => collapsed', [
                animate(500, style({ height: '0px'}))
            ]),
        ]),
    ]
})

export class StoryListComponent implements OnDestroy {

    story_subscription: Subscription;
    user_id_subscription: Subscription;
    stories_changed_subscription: Subscription;
    update_story_rating_subscription: Subscription;
    user_id: number;
    stories: Story[] = [];
    selected_story: Story = new Story();

    /**
     * Injecting our story data service into this component
     */
    constructor(private story_data_service: StoryDataService, private sanitizer: DomSanitizer) {
        this.user_id_subscription = this.story_data_service.userIdChanged$.subscribe(
            user_id => this.getTopStories(user_id)
        );

        this.stories_changed_subscription = this.story_data_service.storiesChanged$.subscribe(
            updated_stories => this.receiveStories(updated_stories)
        );
    }

    /**
     * Get the top stories list
     * @param user_id
     */
    getTopStories(user_id: number) {
        this.user_id = user_id

        // get stories subscription
        this.story_subscription = this.story_data_service.getStories(user_id).subscribe(
            retrieved_stories => this.receiveStories(retrieved_stories)
        );
    }

    /**
     * Receives stories form http service and stores them in a local stories array.
     * Does some initial story modifications
     * @param retrieved_stories
     */
    receiveStories(retrieved_stories: Story[]) {
        let stories = retrieved_stories;

        for (let story of stories) {
            story.collapsed = true;
            story.details_expanded = false;
            story.gone = false;
            story.up_votes = parseInt(story.up_votes);
            story.down_votes = parseInt(story.down_votes);
            story.url = this.sanitizeUrl(story.url);
            story.frame_url = this.sanitizeUrl('');
            story.summary_lines = story.snippet.split('|');
        }

        this.stories = stories;
    }
    
    /**
     * On story header click, either expand it, or collapse it.
     */
    toggleStoryHeader(event: Event, story: Story) {
        // toggle visibility properties
        if (story.collapsed) {
            story.collapsed = false;
        } else {
            this.collapseStory(story);
        }
        // collapse the last selected_story so that we only have one story open at a time
        if (this.selected_story.story_id && this.selected_story.story_id != story.story_id) {  // if opening a different story than the one selected
            this.collapseStory(this.selected_story);
        }
        this.selected_story = story

        event.stopPropagation();
    }

    /**
     * Sets story collapsed flag to true
     * Closes any voting button components if they have been set
     */
    collapseStory(story: Story) {
        story.collapsed = true;

        if (story.up_vote_component) {
            story.up_vote_component.close();
        }
        if (story.down_vote_component) {
            story.down_vote_component.close();
        }
    }

    /**
     * Handle story rating up_voting and down_voting
     * Update current story's up votes or down votes depending on what has been pressed before
     * Send the data to the server and return the calculated rating and score
     * Update the story with the newly calculated rating and score
     */
    updateStoryRating(event: Event, story: Story, rating_action: string, selected_text: string) {
        story.vote_text = selected_text;

        if (story.last_rating_action == null) {     // fresh story rating for user
            this.rateStory(story, rating_action, 1, 0);
        }
        else {                                      // change existing story rating if user has previously rated
            if (story.last_rating_action != rating_action) {
                this.rateStory(story, rating_action, 1, 1);
            }
        }
        // update story rating rating on the backend, and update the story with new values when data is returned
        this.update_story_rating_subscription = this.story_data_service
            .updateStoryRating(this.user_id, story)
            .subscribe(
                // update ui with updated story rating and score
                updated => {story.position = updated.story.position,
                            story.rating = updated.story.rating}
            );

        event.stopPropagation();
    }

    /**
     * Rate the current story on up or down vote click
     * @param story: Current story
     * @param rating_action: Whether we want to up-vote or down-vote
     * @param increment: Increment the correct stat
     * @param decrement: We only decrement stories for which the rating is getting switched. New sotries do not use this
     */
    rateStory(story, rating_action, increment, decrement) {
        if (rating_action == 'up_vote') {
            story.up_votes += increment;
            story.down_votes -= decrement;
            story.last_rating_action = 'up_vote';
        }
        else if (rating_action == 'down_vote') {
            story.up_votes -= decrement;
            story.down_votes += increment;
            story.last_rating_action = 'down_vote';
        }
    }

    /**
     * Use the built in DOM sanitizer to sanitize the url
     * @param url
     */
   sanitizeUrl(url: string) {
        return <string> this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    /**
     * Called when the component is destroyed
     * Nullify all data subscriptions to prevent memory leaks
     */
    ngOnDestroy() {
        // Unsubscribe from the data service when this module is destroyed
        if (this.user_id_subscription != null) { this.user_id_subscription.unsubscribe(); }
        if (this.story_subscription != null) { this.story_subscription.unsubscribe(); }
        if (this.update_story_rating_subscription != null) { this.update_story_rating_subscription.unsubscribe(); }
        if (this.stories_changed_subscription != null) { this.stories_changed_subscription.unsubscribe(); }
    }
    
}