/**
 *  @file       CollectionSearchResultWidget.js
 *  This widget is displayed for each collection in a collection search result.
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/
 
function CollectionSearchResultWidget(params) {
    if(params) {
        this.init(params);
    }
}
CollectionSearchResultWidget.prototype = new Widget();

CollectionSearchResultWidget.prototype.init = function(params) {
    Widget.prototype.init.call(this, params);

    var collectionInfoWidgetContainer = $('#collection_info_widget_container');
    if(collectionInfoWidgetContainer.length == 0) {
        throw new Error('collectionInfoWidgetContainer not found at: '+collectionInfoWidgetContainer.selector);
    }
    this.collectionInfoWidgetContainer = collectionInfoWidgetContainer;
    
    var collectionInfoWidgetTemplate = $('#collection_info_widget_template');
    if(collectionInfoWidgetTemplate.length == 0) {
        throw new Error('collectionInfoWidgetTemplate not found');
    }
    this.collectionInfoWidgetTemplate = collectionInfoWidgetTemplate;

    

    
    
    /* When the 'info' button is clicked, create a new Collection info widget */
    this.container.children('.collection_info_button').click(function(me){
        return function() {
            me.showCollectionInfo();
        };
    }(this));
}

/**
 *  This function should be called when the info button is clicked on the widget.
 *  it will retrieve the information for the collection, and create a new
 *  CollectionInfoWidget to display it.
 **/
CollectionSearchResultWidget.prototype.showCollectionInfo = function() {
    
    var id = this.id;
    
    /* Retrieve collection info */
    this.panel.toggleLoadingNotification();
    $.getJSON(
        'info/'+id, function(me) {
            return function(data, status) {
                me.createCollectionInfoWidget(data);
                me.panel.toggleLoadingNotification();
            };
        }(this)
    );
    
};

/**
 *  Here is where we create the actual CollectionInfoWidget to display the 
 *  collection's data.
 *
 *  @param  data        Object  -   JSON object from $.getJSON call.
 **/
CollectionSearchResultWidget.prototype.createCollectionInfoWidget = function(data) {
    var collectionInfoWidget = new CollectionInfoWidget({
        template: this.collectionInfoWidgetTemplate, 
        context: data, 
        panel: this.panel
    });
    this.collectionInfoWidget = collectionInfoWidget;
    
    this.collectionInfoWidgetContainer.html(collectionInfoWidget.container);
    
};

