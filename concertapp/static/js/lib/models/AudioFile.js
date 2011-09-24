/**
 *  @file       AudioFile.js
 *  
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/
 
/**
 *  An audio file object.
 *  @class
 *  @extends    ConcertModel
 **/
var AudioFile = ConcertModel.extend(
	/**
	 *	@scope	AudioFile.prototype
	 **/
{
    relations: [
        {
            type: Backbone.HasOne, 
            key: 'collection', 
            relatedModel: 'Collection',
            includeInJSON: "id"
        },
        {
            type: Backbone.HasMany, 
            key: 'events', 
            relatedModel: 'Event',
            includeInJSON: "id"
        },
        {
            type: Backbone.HasMany, 
            key: 'segments', 
            relatedModel: 'AudioSegment',
            includeInJSON: "id"
        },
        {
            type: Backbone.HasOne, 
            key: 'uploader', 
            relatedModel: 'User',
            includeInJSON: "id"
        }
    ], 
    name: 'audiofile', 

    /* Static object mapping short strings to 
    display strings */
    DISPLAY_STATUS: {
        LOWER: {
            'u': 'uploading', 
            'p': 'processing',
            'd': 'done'
        },
        UPPER: {
            'u': 'Uploading',
            'p': 'Processing',
            'd': 'Done'
        }, 
    }, 

    /**
     *    handle to interval that is checking this audioFile's status
     **/
    _statusCheckerHandle: null,

    /**
     *  Gets the status string for display.
     *
     *  @param    {String}    "UPPER" | "LOWER"
     **/
    getDisplayStatus: function (upperOrLower) {
        return this.DISPLAY_STATUS[upperOrLower][this.get('status')];
    }, 

    initialize: function () {
        ConcertModel.prototype.initialize.apply(this, arguments);

        /* Default value for status is 'u' */
        if(!this.get('status')) {
            this.set({'status': 'u'});
        }

        /* Default value for progress is 0 */
        if(!this.get('progress')) {
            this.set({'progress': 0});
        }

        // if(this.get('uploader')) {
        //     this.get('uploader').get('uploadedFiles').add(this);
        // }


        _.bindAll(this, '_handle_upload_done');
        _.bindAll(this, '_handle_upload_fail');
        _.bindAll(this, '_handle_upload_always');
        _.bindAll(this, 'fetch');


        /* If the audioFile is not done, and has an id */
        if((this.get('status') != 'd') && this.get('id')) {
            /* We need to continue checking progress */
            this.beginStatusChecking();
        }
    }, 

    /**
     *    Continuously check for the audio file's status.
     **/
    beginStatusChecking: function () {
        /* Check every 500ms for updates */
        this._statusCheckerHandle = setInterval(this.fetch, 1000);
    }, 

    /**
     *  Returns the path to the audio file specified by type.
     *
     *  @param  {String: ogg|mp3}    type    -   The type of audio file
     **/
    get_audio_src: function(type) {
        var id = this.get('id');
        
        if(id) {
            return '/media/audio/'+id+'.'+type;
        }
        else {
            return null;
        }
    }, 
    
    /**
     *  Returns the path to the waveform image specified by zoom_level
     *
     *  @param  {Number}    zoom_level    - The zoom level for this waveform image.
     **/
    get_waveform_src: function(zoom_level) {
        var id = this.get('id');
        
        if(id) {
            return '/media/waveforms/'+zoom_level+'/'+id+'.png';
        }
        else {
            return null;
        }
    },

    /**
     *    Begin file uploading.
     *  @param    {Object}    fileUploadData - The object from the
     *    jquery fileupload plugin.
     **/
    upload: function (fileUploadData) {
        /* first set audioFile attribute so we have a context.
        The plugin is configured to call the proper methods
        on the audioFile attribute of this object. */
        fileUploadData.audioFile = this;

        fileUploadData.submit()
            .done(this._handle_upload_done)
            .fail(this._handle_upload_fail)
            .always(this._handle_upload_always);
    },

    /**
     *    When file upload is complete
     **/
    _handle_upload_done: function (data, textStatus) {
        /* Update our model */
        this.set(data);

        this.beginStatusChecking();
    },

    /**
     *    When file upload fails
     **/
    _handle_upload_fail: function (data, textStatus) {
        console.log('AudioFile._handle_upload_fail');
        console.log('data:');
        console.log(data);
    }, 

    /**
     *    Always after file is uploaded
     **/
    _handle_upload_always: function (data, textStatus) {
        
    }
    
});

/**
 *  A set of audio file objects
 *  @class
 *  @extends    Backbone.Collection
 **/
var AudioFileSet = Backbone.Collection.extend(
    /**
	 *	@scope	AudioFile.prototype
	 **/
	
{
    model: AudioFile
});