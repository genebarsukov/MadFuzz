import 'rxjs/add/operator/map';
import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, URLSearchParams} from '@angular/http';
import {Story} from "../models/story";
import {Subject} from 'rxjs/Subject';

@Injectable()
export class StoryDataService {

    // Subscribers affected by this.changeSources() will  be stored here
    private storiesChangedSubscribers = new Subject<Story[]>();
    // subscribers subscribe to this stream
    storiesChanged$ = this.storiesChangedSubscribers.asObservable();

    // Subscribers affected by this.changeUserId() will  be stored here
    private userIdChangedSubscribers = new Subject<number>();
    // subscribers subscribe to this stream
    userIdChanged$ = this.userIdChangedSubscribers.asObservable();

    /**
     * Injecting the Http service into out data service
     */
    constructor(private http: Http) {}

    /**
     * Get user id based on ip at the start of the session
     */
    getUserId() {
        let user_id = this.http.get('app/assets/get_asset.php?action=get_user_id')
            .map(response => <number>response.json().user_id);

        return user_id;
    }

    /**
     * Gets a batch of stories on initial page load
     * @param user_id: User id retrieved based on ip
     * @returns {Story[]}
     */
    getStories(user_id: number) {
        let params = JSON.stringify({
            user_id: user_id
        });
        let stories = this.http.get('app/assets/get_asset.php?action=get_top_stories&params=' + params)
            .map(response => <Story[]>response.json().data);
        
        return stories;
    }

    /**
     * Save a new or existing source object.
     * If the object is new, the new source_id and scan record data are returned.
     * @param source: Source object
     */
    updateStoryRating(user_id: number, story: Story) {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options = new RequestOptions({headers: headers});

        let params = JSON.stringify({
            user_id: user_id,
            story_id: story.story_id,
            rating_action: story.last_rating_action,
            vote_text: story.vote_text,
            rand_mod: story.rand_mod,
        });

        let body = new URLSearchParams();
        body.set('action', 'update_story_rating');
        body.set('params', params);

        let updated = this.http.post('app/assets/get_asset.php', body, options)
            .map(response => response.json());

        return updated;
    }

    getSearchResults(search_string: string, story_id: number, user_id: number) {
        let params = JSON.stringify({
            search_string: search_string,
            story_id: story_id,
            user_id: user_id
        });

        let items = this.http.get('app/assets/get_asset.php?action=get_search_results&params=' + params)
            .map(response => <Story[]>response.json().items);

        return items;
    }

    getAutoCompleteItems(search_string: string) {
        let params = JSON.stringify({
            search_string: search_string
        });

        let items = this.http.get('app/assets/get_asset.php?action=get_auto_complete_items&params=' + params)
            .map(response => <Story[]>response.json().items);

        return items;
    }

    changeSources(stories: Story[]) {
        this.storiesChangedSubscribers.next(stories);
    }

    changeUserId(user_id: number) {
        this.userIdChangedSubscribers.next(user_id);
    }
}