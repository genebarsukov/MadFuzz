import {Component, Input} from '@angular/core';
import {StoryDataService} from '../../services/story-data.service';
import {Story} from "../../models/story";
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'search-box',
    templateUrl: './search-box.component.html',
    styleUrls: ['./search-box.component.css']
    //templateUrl: 'app/components/search-box/search-box.component.html',
    //styleUrls: ['app/components/search-box/search-box.component.css']
})

export class SearchBoxComponent {

    auto_complete_subscription: Subscription;
    search_subscription: Subscription;
    text_hint: string = 'Search For Stories';
    search_string: string = '';
    auto_complete_showing: boolean = false;
    auto_complete_items: Story[] = []
    search_results: Story[] = [];
    @Input() user_id: number = 0;


    /**
     * Injecting our story data service into this component
     */
    constructor(private story_data_service: StoryDataService) {
    }

    /**
     * Used mainly to select the input text upon clicking
     * @param event
     */
    onSearchBoxClick(event: Event) {
        let input_element = <HTMLInputElement> event.srcElement;
        input_element.setSelectionRange(0, input_element.value.length);
        this.onChange();
    }

    /**
     * Angular on change callback for our input
     * When typing in text, it will send a request to the server and generate an auto complete list of titles and story
     * ids. WHen deleting all text, it will hide the auto-complete drop-down
     */
    onChange() {
        if (this.search_string.length > 0) {
            this.toggleAutoCompleteList(true);
            this.auto_complete_subscription = this.story_data_service.getAutoCompleteItems(this.search_string).subscribe(
                auto_complete_items => {this.auto_complete_items = auto_complete_items}
            );

        } else {
            this.toggleAutoCompleteList(false);
        }
    }

    /**
     * Trigger search by hitting the enter key when the search input box is selected
     * @param event
     */
    onSearchKeyPress(event: any) {
        if (event.key == "Enter") {
            this.getSearchResults(event, null)
        }
    }


    /**
     * Close the auto-complete list
     * @param show
     */
    toggleAutoCompleteList(show: boolean) {
        this.auto_complete_showing = show;
    }

    /**
     * When clicking on an auto complete item in the list, go to the server and retrieve the full data set
     * @param event: Triggering event
     * @param item: The auto-complete item the user clicked on
     */
    autoCompleteSearch(event: Event, item: Story) {
        this.auto_complete_items = [item]
        this.search_string = item.title;
        this.auto_complete_showing = false;

        this.getSearchResults(event, item.story_id);
    }

    /**
     * Hide the auto complete window when the user clicks somewhere else on the page
     * The reason for the timeout there is that focus out will be triggered even when the user clicks on an auto
     * complete item, and we do not want this action to be interrupted, hence we wait
     */
    collapseAutocompleteOnFocusOut() {
        let self = this;

        setTimeout(function() {
            self.auto_complete_showing = false;;
        }, 500)
    }
    /**
     * Search for existing older stories when the search button is clicked
     */
    getSearchResults(event: Event, story_id: number) {
        this.toggleAutoCompleteList(false);
        if (this.search_string.length > 0) {
            // Gets search results based on string matching
            this.search_subscription = this.story_data_service.getSearchResults(this.search_string, story_id, this.user_id).subscribe(
                search_results => this.processSearchResults(search_results)
            )
        } else {
            // Gets search results based on ids because we have exvact matches
            this.search_subscription = this.story_data_service.getStories(this.user_id).subscribe(
                search_results => this.processSearchResults(search_results)
            )
        }
        event.stopPropagation();
    }

    /**
     * Notifies whoever is registered with the data service that new results came in
     * In this case it would be our StoryListComponent class
     * @param search_results: Array of Stories with full data
     */
    processSearchResults(search_results: Story[]) {
        this.story_data_service.changeSources(search_results);
    }
    /**
     * Called when the component is destroyed
     */
    ngOnDestroy() {
        // Unsubscribe from the data service when this module is destroyed
        if (this.auto_complete_subscription != null) { this.auto_complete_subscription.unsubscribe(); }
        if (this.search_subscription != null) { this.search_subscription.unsubscribe(); }
    }
    
}