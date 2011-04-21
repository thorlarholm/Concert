/**
 *  @file       ListWidget.js
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/

/**
 *  This is a widget that is found in the list panel.
 *  page.
 *  @class
 *  @extends    Widget
 **/
var ListWidget = Widget.extend(
	/**
	 *	@scope	ListWidget.prototype
	 **/
{
    
    initialize: function() {
        Widget.prototype.initialize.call(this);

        var params = this.options;
        
        this.model.bind('change', this.render);
        _.bindAll(this, 'render');
    },
    render: function() {
        Widget.prototype.render.call(this);
        
        return this;
    },    
    events: {
        'click': '_handle_click'
    },
    
    /**
     *  When this widget was clicked on.  Subclasses all probably need to handle
     *  this.
     **/
    _handle_click: function(e) {
        
    },
    
    /**
     *  When the model that this widget represents is selected, we will 
     *  add a selected class.  Called from the panel.
     **/
    select: function() {
        var el = $(this.el);
        el.addClass('selected');
    }, 
    
    /**
     *  When another model is selected, remove the selected class from this 
     *  segment.  Called from the panel.
     **/
    deselect: function() {
        var el = $(this.el);
        el.removeClass('selected');
    }, 
});

