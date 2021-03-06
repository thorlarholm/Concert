from django.core.context_processors import csrf
from concertapp.collection.api import MemberCollectionResource
from django.utils import simplejson
from concertapp.users.api import UserResource


###
# Allows certain data to be "bootstrapped" into place, i.e. sent to each template
# where it is applicable.
# @class
###
class ConcertBootstrapDataMiddleware(object):
    def process_template_response(self, request, response):
        user = request.user
        
        # If the view did not create a 'data' object in the context, create
        # an empty one.
        if 'data' not in response.context_data:
            response.context_data['data'] = {}

        # If the user is logged in, we will need the following data on the page.
        if user.is_authenticated():                
            # Data for user object
            userResource = UserResource()
            dehydratedUser = userResource.full_dehydrate(obj=user)
            response.context_data['data']['userData'] = dehydratedUser.data
            
            # Data for collections to which the user is a member
            r = MemberCollectionResource()
            r.set_user(user)
            response.context_data['data']['memberCollectionsData'] = r.as_dict(request)
                        
        # combine above data, and any data that the view sent in into a single json 
        # object.
        response.context_data['data'] = simplejson.dumps(response.context_data['data'])

        return response
        
        
###
# Ensures that CSRF stuff is added to template context.
# @class
###
class ConcertCSRFMiddleware(object):
    def process_template_response(self, request, response):
        response.context_data.update(csrf(request))
        
        return response
