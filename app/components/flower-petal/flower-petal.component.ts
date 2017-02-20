import {Component, Input, AnimationTransitionEvent, trigger, state, style, transition, animate, keyframes} from '@angular/core';
import {Story} from "../../models/story";

@Component({
    selector: 'flower-petal',
    // These paths are used when in dev mode and not using pre-compiled typescript
    //templateUrl: 'app/components/flower-petal/flower-petal.component.html',
    //styleUrls: ['app/components/flower-petal/flower-petal.component.css'],
    templateUrl: './flower-petal.component.html',
    styleUrls: ['./flower-petal.component.css'],
    animations: [
        trigger('petal_1_state', [
            state('inactive', style({
                transform: 'translate(0, 0)',
            })),
            state('active',   style({
                transform: 'translate(0, -110%)'
            })),

            transition('inactive => active', [
                animate(100, keyframes([
                    style({
                        transform: 'translateY(-110%)', offset: 1
                    })
                ]))
            ]),
            transition('active => inactive', [
                animate(150, keyframes([
                    style({
                        transform: 'translateY(-110%)', offset: 0.66
                    }),
                    style({
                        transform: 'translate(0, 0)', offset: 1
                    })
                ]))
            ])
        ]),
        trigger('petal_2_state', [
            state('inactive', style({
                transform: 'translate(0, 0)'
            })),
            state('active',   style({
                transform: 'translate(110%, -110%)'
            })),

            transition('inactive => active', [
                animate(200, keyframes([

                    style({
                        transform: 'translateY(-110%)', offset: 0.5
                    }),
                    style({
                        transform: 'translate(110%, -110%)', offset: 1
                    })
                ]))
            ]),
            transition('active => inactive', [
                animate(150, keyframes([
                    style({
                        transform: 'translate(110%, -110%)', offset: 0.33
                    }),
                    style({
                        transform: 'translate(0, -110%)', offset: 0.66
                    }),
                    style({
                        transform: 'translate(0, 0)', offset: 1
                    })
                ]))
            ])
        ]),
        trigger('petal_3_state', [
            state('inactive', style({
                transform: 'translate(0, 0)'
            })),
              state('active',   style({
                transform: 'translate(110%, 0)'
             })),

            transition('inactive => active', [
                animate(300, keyframes([
                    style({
                        transform: 'translateY(-110%)', offset: 0.33
                    }),
                    style({
                        transform: 'translate(110%, -110%)', offset: 0.66
                    }),
                    style({
                        transform: 'translate(110%, 0)', offset: 1
                    }),
                ]))
            ]),
            transition('active => inactive', [
                animate(150, keyframes([
                    style({
                        transform: 'translate(110%, -110%)', offset: 0.33
                    }),
                    style({
                        transform: 'translate(0, -110%)', offset: 0.66
                    }),
                    style({
                        transform: 'translateY(0)', offset: 1
                    }),

                ]))
            ])
        ]),

        trigger('petal_7_state', [
            state('inactive', style({
                transform: 'translate(0, 0)',
            })),
            state('active',   style({
                transform: 'translate(0, 110%)'
            })),

            transition('inactive => active', [
                animate(100, keyframes([
                    style({
                        transform: 'translateY(110%)', offset: 1
                    })
                ]))
            ]),
            transition('active => inactive', [
                animate(150, keyframes([
                    style({
                        transform: 'translateY(110%)', offset: 0.66
                    }),
                    style({
                        transform: 'translate(0, 0)', offset: 1
                    })
                ]))
            ])
        ]),
        trigger('petal_8_state', [
            state('inactive', style({
                transform: 'translate(0, 0)'
            })),
            state('active',   style({
                transform: 'translate(110%, 110%)'
            })),

            transition('inactive => active', [
                animate(200, keyframes([

                    style({
                        transform: 'translateY(110%)', offset: 0.5
                    }),
                    style({
                        transform: 'translate(110%, 110%)', offset: 1
                    })
                ]))
            ]),
            transition('active => inactive', [
                animate(150, keyframes([
                    style({
                        transform: 'translate(110%, 110%)', offset: 0.33
                    }),
                    style({
                        transform: 'translate(0, 110%)', offset: 0.66
                    }),
                    style({
                        transform: 'translate(0, 0)', offset: 1
                    })
                ]))
            ])
        ]),
        trigger('petal_9_state', [
            state('inactive', style({
                transform: 'translate(0, 0)'
            })),
            state('active',   style({
                transform: 'translate(110%, 0)'
            })),

            transition('inactive => active', [
                animate(300, keyframes([
                    style({
                        transform: 'translateY(110%)', offset: 0.33
                    }),
                    style({
                        transform: 'translate(110%, 110%)', offset: 0.66
                    }),
                    style({
                        transform: 'translate(110%, 0)', offset: 1
                    }),
                ]))
            ]),
            transition('active => inactive', [
                animate(150, keyframes([
                    style({
                        transform: 'translate(110%, 110%)', offset: 0.33
                    }),
                    style({
                        transform: 'translate(0, 110%)', offset: 0.66
                    }),
                    style({
                        transform: 'translateY(0)', offset: 1
                    }),

                ]))
            ])
        ])
    ]
})

/**
 * Special button component that is used to handle story up-voting and down-voting actions
 * Mainly used to perform a fancy "flower petal" animation
 * Stores the reason why a user rated a story a certain way and lets the story be updated with it for that user
 */
export class FlowerPetalComponent {
    /** All properties with the @Input decorator are assigned by the parent component in the html */
    @Input() id: string;                    /** Identifies the button element */
    @Input() action: string;                /** Used to update the current story being updated on */
    @Input() story: Story;                  /** The current story that will bw updated with the button click */
    @Input() type: string;                  /** What the button does: used to choose the correct animation */
    @Input() text: any[] = [];              /** The text to display on the 'petals' of the button */
    @Input() selected_text: string = '';    /** Corresponds to which 'petal' was selected by the user */
    hidden: boolean = true;
    up_states: any = {                      /** These are used for state changes when animating the button */
        petal_1_state: 'inactive',
        petal_2_state: 'inactive',
        petal_3_state: 'inactive'
    }
    down_states: any = {
        petal_7_state: 'inactive',
        petal_8_state: 'inactive',
        petal_9_state: 'inactive'
    }
    

    /**
     * Toggle the flower button - either expand or collapse the petals
     */
    toggleState() {
        if (this.type == 'up') {
            for (let state in this.up_states) {
                if (this.up_states[state] == 'inactive') {
                    this.up_states[state] = 'active';
                } else {
                    this.up_states[state] = 'inactive';
                }
            }
        } else if (this.type == 'down') {
            for (let state in this.down_states) {
                if (this.down_states[state] == 'inactive') {
                    this.down_states[state] = 'active';
                } else {
                    this.down_states[state] = 'inactive';
                }
            }
        }
    }

    /**
     * Collapse the flower button petals
     */
    close() {
        if (this.type == 'up') {
            for (let state in this.up_states) {
                this.up_states[state] = 'inactive';
            }
        } else if (this.type == 'down') {
            for (let state in this.down_states) {
                this.down_states[state] = 'inactive';
            }
        }
    }

    /**
     * Start animating first flower petal
     * @param event
     * @param petal
     */
    animationStart(event: AnimationTransitionEvent ) {
        if (event.fromState != 'void') {
            this.hidden = false;
        }
    }

    /**
     * Finish animating first flower petal
     * @param event
     * @param petal
     */
    animationDone(event: AnimationTransitionEvent ) {
        if (event.fromState == 'inactive') {
            this.hidden = false;
        }
        else if (event.fromState == 'active') {

            this.hidden = true;
        }
    }

    /**
     * Set the text selected from one of the petals to a local variable for use when updating
     * @param text
     */
    updateSelectedText(text: string) {
        this.selected_text = text;
    }
}