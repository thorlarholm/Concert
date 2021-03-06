/**
 *  @file       TagAutocompleteListInputComponent.js
 *
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/

/**
 *  This is the component used for adding tags to an audio segment.
 *  @class
 *  @extends    AutocompleteListInputComponent
 **/
var TagAutocompleteListInputComponent = AutocompleteListInputComponent.extend({
    initialize: function() {
        AutocompleteListInputComponent.prototype.initialize.call(this);

        var params = this.options;
        
    },

    /**
     *  Handle a new token that was entered in the inputElement.
     *
     *  @param  {String}    token   The token that was entered.
     **/
    _handle_new_token: function(token) {
        AutocompleteListInputComponent.prototype._handle_new_token.call(this, token);
        
        /* A new tag has been entered, tell the page. */
        this.panel.page.tag_current_segment(token);
        
        return;
    },
    
});
