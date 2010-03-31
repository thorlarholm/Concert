from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.views.generic.create_update  import create_object
from django.views.generic.simple import direct_to_template
from django.contrib.auth import authenticate, login

from concertapp.concert.models  import *
from concertapp.concert.forms   import BlogpostForm, RegistrationForm, UploadFileForm

def posts(request):
    posts = Blogpost.objects.all()

    return render_to_response("posts.html", {
        'posts': posts },
        RequestContext(request))
    
def create_post(request):
    return create_object(request,template_name='edit_post.html',
                         post_save_redirect='/',
                         form_class=BlogpostForm)
    
@login_required
def create_ajaxy_post(request):
    form = BlogpostForm()
    return direct_to_template(request,
                              template='edit_ajaxy_post.html',
                              extra_context={'form':form} )
    
def users(request):
    users = User.objects.all()

    return render_to_response("users.html", {'users': users},
            RequestContext(request))

def create_user(request):
    return create_object(request, 
            template_name='create_user.html',
            post_save_redirect='/users/',
            form_class=RegistrationForm)

def audio(request):
    audio = Audio.objects.all()

    return render_to_response("audio.html", {'audio': audio},
            RequestContext(request))

def upload_audio(request):
    return create_object(request,
            template_name='upload_audio.html',
            post_save_redirect='/audio/',
            form_class=UploadFileForm)

def dumb_login(request):
    user = authenticate(username='josh', password='josh')
    if user is not None:
        if user.is_active:
            login(request, user)
            return HttpResponseRedirect('/audio/')
        else:
            return HttpResponseRedirect('/login')
    else:
        return HttpResponseRedirect('/login')

def dumb_logout(request):
    logout(request)
    return HttpResponseRedirect('/audio/')
