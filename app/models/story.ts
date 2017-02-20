
export class Story {
    story_id: number;
    url: string;
    title: string;
    author: string;
    snippet: string;
    source: string;
    position: number;
    rating: number;
    up_votes: any;
    down_votes: any;
    last_rating_action: string;
    collapsed: boolean;
    details_expanded: boolean;
    gone: boolean;
    frame_url: string;
    vote_text: string;
    rand_mod: number;
    up_vote_component: any;     // set in html on story click references the up-vote button for the current story
    down_vote_component: any;   // set in html on story click references the down-vote button for the current story
    summary_lines: string[];
}