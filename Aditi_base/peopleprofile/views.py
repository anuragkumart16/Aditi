from django.shortcuts import render
from django.core.exceptions import PermissionDenied

def land(request):
    if request.user.is_authenticated:
        username=request.user.username
        return render (request,"land.html",{'username':username})
    else:
        raise PermissionDenied
