/**
 *  @file       Widget.js
 *  This contains general stuff that needs to take place for any widget on the UI.
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/

function Widget(params) {
    if(params) {
        this.init(params);
    }
}

/**
 *  Create the DOM elements associated with this widget using a template.  The
 *  container member variable is then set automatically for the widget.  The widget
 *  is not inserted into the DOM.
 *
 *  @param  params.template        jQuery tmpl object   -   THe template.
 *  @param  params.context        Object     - the context to send to template.
 **/
Widget.prototype.init = function(params) {
    var template = params.template;
    if(typeof(template) == 'undefined') {
        throw new Error('params.template is undefined');
    }
    
    var context = params.context;
    if(typeof(context) == 'undefined') {
        throw new Error('params.context is undefined');
    }
    
    this.container = template.tmpl(context);
}