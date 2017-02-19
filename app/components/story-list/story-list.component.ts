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
    up_vote_component: any;
    down_vote_component: any;

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
     * Reformat the story snippet into multiple lines
     */
    buildSummaryLines(snippet: string) {
        let summary_lines: string[] = [];

        let lines = snippet.split('|');
        for (let line of lines) {
            summary_lines.push(line)
        }

        return summary_lines
    }
    /**
     * On story header click, either expand it, or collapse it.
     */
    toggleStoryHeader(event: Event, story: Story) {
        story.up_vote_component = this.up_vote_component;
        story.down_vote_component = this.down_vote_component;
        
        // toggle visibility properties
        if (story.collapsed) {
            story.collapsed = false;
        } else {
            story.collapsed = true;
        }
        // collapse the last selected_story so that we only have one story open at a time
        if (this.selected_story.story_id != story.story_id) {  // if opening a different story than the one selected
            this.selected_story.collapsed = true;
        }
        else {  // if collapsing the currently selected story

        }
        if (this.selected_story.up_vote_component) {
            this.selected_story.up_vote_component.close();
        }
        if (this.selected_story.down_vote_component) {
            this.selected_story.down_vote_component.close();
        }
        // set the new selected_story to the one just clicked
        this.selected_story = story

        if (this.selected_story.up_vote_component) {
            this.selected_story.up_vote_component.close();
        }
        if (this.selected_story.down_vote_component) {
            this.selected_story.down_vote_component.close();
        }
        event.stopPropagation();
    }
    /**
     * On story snippet click, open the story details frame
     */
    openStoryDetails(event: Event, story: Story) {
        this.selected_story = story;

        event.stopPropagation();
    }
    
    /**
     * Close story details
     */
    closeStoryDetails(event: Event, selected_story: Story) {
        this.selected_story.details_expanded = false;

        event.stopPropagation();
    }

    /**
     * Remove a story item from the UI once you are done with it or are not interested in it
     */
    removeStory(event: Event, story: Story) {
        story.gone = true;

        event.stopPropagation();
    }

    /**
     * Handle story rating up_voting and down_voting
     */
    updateStoryRating(event: Event, story: Story, rating_action: string, selected_text: string) {
        story.vote_text = selected_text;
        // fresh rating
        if (story.last_rating_action == null) {
            if (rating_action == 'up_vote') {
                story.up_votes += 1;
                story.last_rating_action = 'up_vote';
            } else if (rating_action == 'down_vote') {
                story.down_votes += 1;
                story.last_rating_action = 'down_vote';
            }
        } // change existing rating
        else {
            if (story.last_rating_action != rating_action) {
                if (rating_action == 'up_vote') {
                    story.up_votes += 1;
                    story.down_votes -= 1;
                    story.last_rating_action = 'up_vote';
                } else if (rating_action == 'down_vote') {
                    story.down_votes += 1;
                    story.up_votes -= 1;
                    story.last_rating_action = 'down_vote';
                }
            }
        }
        this.calcRating(story);

        // update story rating subscription
        this.update_story_rating_subscription = this.story_data_service
            .updateStoryRating(this.user_id, story)
            .subscribe(
                updated => this.checkRatingUpdate(story, updated)
            );

        event.stopPropagation();
    }
    /**
     * Recalculate story rating based on up-votes and down-votes
     */
    calcRating(story: Story) {
        story.rating = Math.round(100 * story.up_votes / (story.up_votes + story.down_votes));
    }

    /**
     * Callback executed after story is updated and date is returned from the back end
     * @param story
     * @param updated
     */
    checkRatingUpdate(story: Story, updated: {story: Story}) {
        if (updated.story) {
            story.position = updated.story.position;
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
     */
    ngOnDestroy() {
        // Unsubscribe from the data service when this module is destroyed
        if (this.user_id_subscription != null) { this.user_id_subscription.unsubscribe(); }
        if (this.story_subscription != null) { this.story_subscription.unsubscribe(); }
        if (this.update_story_rating_subscription != null) { this.update_story_rating_subscription.unsubscribe(); }
        if (this.stories_changed_subscription != null) { this.stories_changed_subscription.unsubscribe(); }
    }
    
}