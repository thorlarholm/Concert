/**
 *  @file       ModalUploadPanel.js
 *
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/

/**
 *  @class  Panel used for uploading audio. Pops up as a modal dialog.
 *  @extends    Panel
 **/
var ModalUploadPanel = Panel.extend(
    /**
     *  @scope  ModalUploadPanel.prototype
     **/
{
    initialize: function() {
        Panel.prototype.initialize.call(this);

        var params = this.options;

        /**
         *    Container for upload display at top of layout.
         **/
        this.uploadStatusContainer = $('#upload_status_container');

        /**
         *    Template for "upload" link
         **/
        this.uploadLinkTemplate = $('#modaluploadpanel_upload-link_template');

    },

    /**
     *    When we're on the collections view, hide upload status area.
     **/
    render_collections: function () {
        this._hideStatus();
    },

    /**
     *    When we're looking at a collection, show status
     *    of this collection's uploads.
     **/
    render_collection: function (collectionId, collection) {
        this._showStatus(collection);
    }, 

    /**
     *  When we're looking at a collection's audio, show status
     *  of this collection's uploads.
     **/
    render_collection_audio: function (collectionId, collection) {
        this._showStatus(collection);
    }, 

    /**
     *    When we're looking at a specific audio file, show
     *    status of this collection's uploads.
     **/
    render_collection_audio_file: function (collectionId, audioFileId, collection, audioFile) {
        this._showStatus(collection);
    }, 

    /**
     *    When we're looking at an audio segment, show status
     *    of this collection's uploads.
     **/
    render_collection_audio_segment: function (collectionId, audioFileId, audioSegmentId, collection, audioFile, audioSegment) {
        this._showStatus(collection);
    },
    
    /**
     *  When we're on upload route
     **/
    render_collection_upload: function(collectionId, collection) {
        /* Show modal window */
        this._show();
    }, 
    
    /**
     *  Show the modal panel
     **/
    _show: function() {
        $('#upload_panel_form').fileupload({
            url: "/upload/", 
            dataType: "json", 
            dropZone: null, 
            fileInput: $('#upload_panel_file_chooser')
        });
        this.el.removeClass('hidden');
        
        /* Bind to the escape key */
        $(document).bind('keyup', _.bind(function(e) {
            if(e.keyCode == 27) {
                /* go back to wherever we were */
                // com.concertsoundorganizer.router.goBack();
                /* Just close window for now */
                this._hide();
            }
        }, this));
    }, 
    
    /**
     *  Hide the modal panel
     **/
    _hide: function() {
        this.el.addClass('hidden');
    },

    /**
     *  Show the upload status for a 
     *  given collection.
     **/
    _showStatus: function (collection) {
        /* render upload link in status container */
        this.uploadStatusContainer.html(
            this.uploadLinkTemplate.tmpl(collection)
        );

        /* Show upload status container, since we're on a specific collection */
        this.uploadStatusContainer.show();

    }, 

    /**
     *  Hide upload status.
     **/
    _hideStatus: function () {
        this.uploadStatusContainer.hide();
    }, 
});

