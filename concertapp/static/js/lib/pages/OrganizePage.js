/**
 *  @file       OrganizePage.js
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/ 


/**
 *  The panels and widgets for the organize page.
 *	@class
 *  @extends    LoggedInPage
 **/
var OrganizePage = LoggedInPage.extend({
    
    _initializeModelManager: function(params) {
        return new OrganizePageModelManager(params);
    }, 
    _initializeViews: function() {
        LoggedInPage.prototype._initializeViews.call(this);
        
        var modelManager = this.modelManager;
        
        /* This is our HTML5 audio player */
        var audio = new Audio();
        audio.autoplay = false;
        audio.preload = 'auto';
        this.audio = audio;
        
        /* The callback function for an audio loop */
        this.audioLoopTimeUpdateCallback = null;
        
        
        /* This is the type of audio file we will use */
        this.audioType = com.concertsoundorganizer.compatibility.audioType;
        
        
        /*  Create waveform overview panel */
        this.overviewPanel = new OverviewWaveformPanel({
            page: this, 
            el: $('#overview_waveform_panel'),
            selectedAudioSegments: modelManager.selectedAudioSegments,
            selectedAudioFiles: modelManager.selectedAudioFiles
        });

        /* Create waveform detail panel */
        this.detailPanel = new DetailWaveformPanel({
            page: this, 
            el: $('#detail_waveform_panel'),
            selectedAudioSegments: modelManager.selectedAudioSegments,
            selectedAudioFiles: modelManager.selectedAudioFiles 
        });


        /* Create the audio list panel */    
        this.audioListPanel = new AudioListPanel({
            page: this, 
            el: $('#audio_list_panel'),
            files: modelManager.collectionAudioFiles,
            segments: modelManager.collectionAudioSegments
        });
        
        
        /* When the space button is pressed, pause/play our audio */
        $(window).bind('keydown', function(me) {
            return function(e) {
                
                if(e.keyCode == 32) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    me.play_pause();
                }
            };
        }(this));
        
    }, 
    
    /**
     *  When a user selects some audio from the audio list.
     *
     *  @param  {Array}     params.files    -   The files selected.
     *  @param  {Array}     params.segments -   The selected segments
     **/
    select_audio: function(params) {
        /* Tell model manager so we can maintain list of instances */
        this.modelManager.select_audio(params);
        
        /* Pause audio if it is currently playing */
        this.pause();
        
        /* Determine what audio was selected */
        var files = params.files;
        var segments = params.segments;
        files || (files = []);
        segments || (segments = []);
        
        /* If one segment was selected */
        if(segments.length == 1) {
            /* Selecting an audio segment */
            this.select_audio_segment(segments[0]);
        }
        /* If one file was selected */
        else if(files.length == 1) {
            /* Selecting a file */
            this.select_audio_file(files[0]);
        }
        /* If files and segments were selected */
        else if(files.length && segments.length) {
            throw new Error('Not implemented multiple selection.');
        }
        /* If more than one file was selected */
        else if(files.length > 1) {
            throw new Error('Not implemented selecting multiple files');
        }
        /* If more than one segment was selected */
        else if(segments.length > 1) {
            throw new Error('Not implemented selecting multiple segments');
        }
        else {
            throw new Error('Invalid parameters for select_audio');
        }
    }, 
    
    /**
     *  When a user has selected a single audio file.
     *
     *  @param  {AudioFile}    selectedAudioFile    -   The AudioFile that was
     *  selected.
     **/
    select_audio_file: function(selectedAudioFile) {
        /* This is where loading notification should be */
        
        /* Load audio file */
        this._load_audio_file(selectedAudioFile, function(me, selectedAudioFile) {
            /* when complete, notify panel */
            return function(){
                me.overviewPanel.audio_file_selected(selectedAudioFile);
                me.detailPanel.audio_file_selected(selectedAudioFile);
            };
        }(this, selectedAudioFile));
    },
    
    /**
     *  When a user has selected a single audio segment
     *
     *  @param  {AudioSegment}    selectedAudioSegment    - The AudioSegment 
     *  that was selected.
     **/
    select_audio_segment: function(selectedAudioSegment) {
        /* Load the audio segment's file into the audio player */
        this._load_audio_file(selectedAudioSegment.get('audioFile'), function(me, selectedAudioSegment) {
            return function() {
                /* when complete, notify panels */
                me.overviewPanel.audio_segment_selected(selectedAudioSegment);
                me.detailPanel.audio_segment_selected(selectedAudioSegment);
            };
        }(this, selectedAudioSegment))
        
    }, 
    
    /**
     *  This will load an audio file into the audio player, and fire the callback
     *  when complete.
     *
     *  @param  {AudioFile}    audioFile    -   the file to load.
     **/
    _load_audio_file: function(audioFile, callback) {
        var audio = this.audio;
        
        /* when the file is done loading */
        $(audio).one('canplaythrough', callback);
        
        
        /* The proper audio source for this browser */
        var audiosrc = audioFile.get(this.audioType);
        
        this.audio.src = audiosrc;
        
    }, 
    
    /**
     *  When a user presses the space bar
     **/
    play_pause: function() {
        /* Get HTML5 audio object */
        var audio = this.audio;
            
        if(audio.paused) {
            this.play();
        }
        else {
            this.pause();
        }
    }, 
    
    play: function() {
        this.audio.play();
        this.detailPanel.autoscrollBool = true;
        
        var playheadInterval = setInterval(function(detailPlayheadWidget, overviewPlayheadWidget) {
            return function() {                
                detailPlayheadWidget.animate();
                overviewPlayheadWidget.animate();
            };
        }(this.detailPanel.playheadComponent, this.overviewPanel.playheadComponent), 
            com.concertsoundorganizer.animation.speed);
            
        this.playheadInterval = playheadInterval;
    },
    
    pause: function() {
        this.audio.pause();
        clearInterval(this.playheadInterval);        
    },
    
    /**
     *  This is called when an area of the waveform was highlighted by the user.
     *
     *  @param  {Number}    startTime    -  The time (in seconds) of highlight start
     *  @param  {Number}    endTime    -    The time of the highlight end.
     **/
    waveform_highlighted: function(startTime, endTime) {
        /* Start audio loop */
        this.start_audio_loop(startTime, endTime);
        
    },
    
    /**
     *  This is called when a waveform is cleared.
     **/
    waveform_highlight_cleared: function() {
        this.clear_audio_loop();
    }, 
    
    /**
     *  This is called when a section of a waveform is selected.  It will start
     *  an interval that will loop a single section of audio.
     *
     *  @param  {Number}    startTime    -  The beginning of the loop.
     *  @param  {Number}    endTime     -   The end of the loop
     **/
    start_audio_loop: function(startTime, endTime) {
        
        /* This function will be called when a timeupdate event occurs. */
        var audioLoopTimeUpdateCallback = function(startTime, endTime) {
            return function(e) {
                var currentTime = this.currentTime;
                
                if(currentTime < startTime || currentTime > endTime) {
                    this.currentTime = startTime;
                }
            };
        }(startTime, endTime);
        /* Save so we can unbind later */
        this.audioLoopTimeUpdateCallback = audioLoopTimeUpdateCallback;
        
        /* When audio loop changes time */
        $(this.audio).bind('timeupdate', audioLoopTimeUpdateCallback);
    }, 
    
    /**
     *  This is called when a highlight is cleared.
     **/
    clear_audio_loop: function() {
        $(this.audio).unbind('timeupdate', this.audioLoopTimeUpdateCallback);
    }, 
    
});
