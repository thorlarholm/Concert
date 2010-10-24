#from django.contrib.auth.models import Group, User
from concertapp.models import Audio, GroupAdmin, Ta
from django import forms
from django.forms import ModelFormg, AudioSegment, Comment, User, Group

##
# A form used to create a new group
##
class CreateGroupForm(ModelForm):
    group_name = forms.CharField(label="Group name", max_length=80,
            required=True)

    class Meta:
        model = GroupAdmin
        exclude = ('admin', 'group')

    ##
    #   Makes sure a duplicate name doesn't exist
    ##
    def clean_group_name(self):
        gname = self.cleaned_data['group_name']
        
        groups = Group.objects.filter(name = gname)

        if len(groups) > 0:
            raise forms.ValidationError('That name is already taken')

        return gname
 
##
# A form used to register a new user in the system
##
class RegistrationForm(ModelForm):
    username = forms.CharField(label='username',
                        max_length=30,
                        required=True)
    email = forms.EmailField(label='email',
                         max_length=30,
                         required=True)
    password1 = forms.CharField(label='password1',
                            max_length=60,
                            required=True,
                            widget=forms.PasswordInput(render_value=False))
    password2 = forms.CharField(label='password2',
                            max_length=60,
                            required=True,
                            widget=forms.PasswordInput(render_value=False))
    class Meta:
        model = User
        exclude = ('username', 'first_name', 'last_name', 'email', 'password',
             'is_staff', 'is_active', 'is_superuser', 'last_login', 
             'date_joined', 'groups', 'user_permissions')

    ##
    # Validates the username field to ensure that the username is unique
    #
    # @param    self   The RegistrationForm object
    ##
    def clean_username(self):
        username = self.cleaned_data['username']
        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            try:
                Group.objects.get(name = username)
            except Group.DoesNotExist:
                return username

        raise forms.ValidationError('The username "%s" is already taken.' %
                username)

##
# The form uploads an audio file to the system
##
class UploadFileForm(ModelForm):
    class Meta:
        model = Audio
        fields = ('wavfile', )
        #exclude = ('user', 'waveform', 'filename', 'oggfile')

    ##
    # Ensures that the wavfile has a valid extension
    #
    # @param    self    The UploadFileForm object
    ##
    def clean_wavFile(self):
        # Get the content-type of the file
        filetype = self.cleaned_data['wavfile'].content_type

         # Ensure the file is wav, ogg, or mp3
        if filetype != 'audio/x-wav' and \
                filetype != 'audio/mpeg' and \
                filetype != 'application/ogg':
            raise forms.ValidationError('Audio file must be wav, mp3, or ogg')

        # Always return the data from the clean_* function
        return self.cleaned_data['wavfile']

##
# Allows the user to create a segment from an audio file or another segment
##
class CreateSegmentForm(ModelForm):
    tag_field = forms.CharField(label='Tag', max_length=80)
    label_field = forms.CharField(label='Label', max_length=80)
    group_id = forms.HiddenInput()
    audio_id = forms.HiddenInput()

    class Meta:
        model = AudioSegment
        fields = ['label_field', 'tag_field', 'beginning', 'end', ]

    ##
    # Ensures that the beginning value is a number and greater than zero
    # 
    # @param    self    The CreateSegmentForm object
    ##
    def clean_beginning(self):
        # Ensure valid numeric data
        try:
            val = float(self.cleaned_data['beginning'])
        except ValueError:
            raise forms.ValidationError('Must be a number')

        # Valid start time
        if val < 0.0:
            raise forms.ValidationError('Must be greater than zero')

        return self.cleaned_data['beginning']

    ##
    # Ensures that the end value is a number and greater than beginning
    # 
    # @param    self    The CreateSegmentForm object
    ##
    def clean_end(self):
        try:
            val = float(self.cleaned_data['end'])
        except ValueError:
            raise forms.ValidationError('Must be a number')

        if val <= float(self.cleaned_data['beginning']):
            raise forms.ValidationError('Must be larger than beginning value')

        return self.cleaned_data['end']

##
# A simple form for renaming an audio segment
##
class RenameSegmentForm(ModelForm):
    class Meta:
        model = AudioSegment
        fields = ['name']
        
##
# A simple form for creating a comment
##
class CreateCommentForm(ModelForm):
    class Meta:
        model = Comment
        fields = ['comment']

