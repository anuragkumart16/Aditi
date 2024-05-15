from django.shortcuts import render

# Create your views here.
def weather(request):
    return render (request,weather.html)