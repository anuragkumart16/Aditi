"""
URL configuration for Aditi_base project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from people.views import *
from peopleprofile.views import *
from tools.views import *
from django.contrib.auth import views as auth_views

urlpatterns = [
    # admin site urls here
    path('admin/', admin.site.urls),

    # urls of people app here
    path("", home ,name="home"),
    path('loggingin', loggingin,name='login'),
    path('logout', logout_view, name='logout'),
    path('signup',signup,name='signup'),

    # urls of peopleprofile app
    path("land",land,name='land'),

    # urls of tools
    path("imagecompressor",imgcompressor,name="imagecompressor"),
    path('compress',compress,name='compress'),
    path('downloading',downloading,name='downloading'),
]
