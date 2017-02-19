/**
 * Created by Gene on 1/16/2017.
 */



class Loader {
   /**
    * Constructor: Displays a selection of loading phrases while Angular 2 is loading
    */
   constructor() {
        var loading_phrases = [
           'Getting the fuzz...',
           'Loading the madness...',
           'To load or not to load...',
           'Lets talk while I load...',
           'I sure hope this loads soon...',
           'I know. I know. Load faster...'
        ];
        var phrase_index = parseInt(Math.random() * loading_phrases.length);
        var phrase = loading_phrases[phrase_index];
        var loading_text = document.getElementById('app-loading-text');

        loading_text.textContent = phrase;
    }
}
/**
 * Perform action on window load
 */
window.onload = function() {
    let loader = new Loader();
}
