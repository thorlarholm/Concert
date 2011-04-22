/**
 *  @file       LoggedInPage.js
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/ 

/**
 *  @class  The main controller for when a user is logged into Concert.
 *  @extends    Page
 **/
var LoggedInPage = Page.extend(
	/**
	 *	@scope	LoggedInPage.prototype
	 **/
{
    
    /**
     *  Our dataset manager is this one.
     **/
    _initializeModelManager: function(params) {
        return new LoggedInModelManager(params);
    }, 
    
    /**
     *  Every page where a user is logged in will display a global options panel.
     **/
    _initializeViews: function() {
        Page.prototype._initializeViews.call(this);

        
        /* Create the globalOptionsPanel (the buttons and menus at the top of 
        the page) */
        this.globalOptionsPanel = new GlobalOptionsPanel({
            page: this, 
            el: $('#global_options_panel'),
            userMemberCollections: this.modelManager.user.get('memberCollections')
        });
        
        /**
         *  The list on the right side of the UI.
         **/
        this.listPanel = new ListPanel({
            page: this, 
            el: $('#list_panel'),
            modelManager: this.modelManager
        });
        
        /**
         *  The events panel on the left side of the UI.
         **/
        this.eventsPanel = new EventsPanel({
            page: this, 
            el: $('#events_list_panel'), 
            modelManager: this.modelManager
        });
        
        /* Create audio controller */ 
        this.audioController = new AudioController({
            page: this
        });

        /*  Create waveform overview panel */
        this.overviewPanel = new OverviewWaveformPanel({
            page: this, 
            el: $('#overview_waveform_panel')
        });
                
        /* Create waveform detail panel */
        this.detailPanel = new DetailWaveformPanel({
            page: this, 
            el: $('#detail_waveform_panel'),
        });
        
    },
    
    _initialize_routes: function() {
        Page.prototype._initialize_routes.call(this);
        
        _.bindAll(this, '_collections_route');
        this.route('collections', 'collections', this._collections_route);
        
        _.bindAll(this, '_collection_route');
        this.route('collection/:collectionId', 'collection', this._collection_route);
        
        _.bindAll(this, '_collection_audio_route');
        this.route(
            'collection/:collectionId/audio',
            'collection_audio',
            this._collection_audio_route
        );
        
        _.bindAll(this, '_collection_audio_file_route');
        this.route(
            'collection/:collectionId/audio/file/:fileId',
            'collection_audio_file',
            this._collection_audio_file_route
        );
        
        _.bindAll(this, '_collection_audio_segment_route');
        this.route(
            'collection/:collectionId/audio/file/:fileId/segment/:segmentId',
            'collection_audio_segment',
            this._collection_audio_segment_route
        );
        
        this.defaultHash = '#collections';
        return;
    }, 
    
    /**
     *  Route for "/#collections".  Lists collections and such.
     **/
    _collections_route: function() {
        this.currentRoute = 'collections';
    }, 
    
    /**
     *  Route for "/#collection/:collectionId".  Shows preview of a collection 
     *  by displaying events on left.
     **/
    _collection_route: function(collectionId) {
        /* select current collection in model manager */
        var collection = this.modelManager.select_collection(collectionId);
        
        
        this.currentRoute = 'collection';
        return [collection];
    }, 
    
    /**
     *  Rotue for "/#collection/:collectionId/audio".  Shows collection's audio
     *  files and segments.
     **/
    _collection_audio_route: function(collectionId) {
        /* Get collection from collection route handler */
        var newArgs = this._collection_route(collectionId);
        
        this.currentRoute = 'collection_audio';
        
        return newArgs;
    }, 
    
    /**
     *  Route for "/#collection/:collectionId/audio/file/:fileId" Shows audio file's
     *  waveform, segments, and events
     **/
    _collection_audio_file_route: function(collectionId, fileId) {
        var newArgs = this._collection_route(collectionId);
        var file = this.modelManager.select_audiofile(fileId);
        newArgs.push(file);
        
        this.currentRoute = 'collection_audio_file';        
        
        return newArgs;
    },
    
    /**
     *  Route for "/#collection/:collectionId/audio/file/:fileId/segment/:segmentId"
     *  Shows audio segment's waveform, parent audio file, and events
     **/
     _collection_audio_segment_route: function(collectionId, fileId, segmentId) {
         var newArgs = this._collection_audio_file_route(collectionId, fileId);
         var segment = this.modelManager.select_audio_segment(segmentId);
         newArgs.push(segment);
         
         this.currentRoute = 'collection_audio_segment';

         return newArgs;
     },
    
    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route : function(route, name, callback) {
        Backbone.history || (Backbone.history = new Backbone.History);
        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
        Backbone.history.route(route, _.bind(function(fragment) {
            var args = this._extractParameters(route, fragment);
            /* Whatever our callback for this route returns, we will push into
            the args array to send along with the route information */
            args = args.concat(callback.apply(this, args));
            
            this.trigger.apply(this, ['route:' + name].concat(args));
        }, this));
    },
    
    create_new_segment: function(startTime, endTime) {
        this.modelManager.create_and_select_new_segment(startTime, endTime, function(me) {
            return function() {
            }
        }(this));
    },
    
    /**
     *  This is called from elsewhere when we are to ensure that a waveform highlight 
     *  is cleared.
     **/
    clear_waveform_highlight: function() {
        this.audioController._clear_audio_loop();
        this.detailPanel.clear_waveform_highlight();
        this.overviewPanel.clear_waveform_highlight();
    },
    
});
    