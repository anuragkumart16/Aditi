from django.shortcuts import render

# Create your views here.
def imgcompressor(request):
    return render(request,'imagecompressor.html')