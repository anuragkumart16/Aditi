from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import logout

# Create your views here.
def home(request):
    return render (request,"index.html")

def loggingin(request):
    if request.method == "POST":
        username= request.POST.get('username')
        password = request.POST.get('password')
        user=authenticate(request,username=username,password=password)
        if user is not None:
            login(request, user)
            return redirect('land')  
        else:
            # Authentication failed, handle invalid credentials
            return render(request, 'index.html', {'error_message': 'Invalid email or password'})
    else:
        # If the request method is GET, render the login form
        return render(request, 'index.html')

def signup (request):
    if request.method == "POST":
        username=request.POST.get("username")
        email=request.POST.get("email")
        password=request.POST.get("password")
        user=User.objects.create_user(username=username,email=email,password=password)
        user.save()
        user=authenticate(request,username=username,password=password)
        if user is not None:
            login(request, user)
            return redirect('land')  
        else:
            # Authentication failed, handle invalid credentials
            return render(request, 'signup.html', {'error_message': 'some error occured try again later'})
    else:
        return render(request,"signup.html")




def logout_view(request):
    logout(request)
    return redirect('home')