from django.shortcuts import render
from django.contrib import messages
from PIL import Image

# Create your views here.
def imgcompressor(request):
    return render(request,'imagecompressor.html')

def compress(request):
    if request.method == 'POST':
        file=request.POST.get("file")
        size=request.POST.get("imgsize")
        image=compressed_img(file,size)
        messages.add_message(request, messages.INFO, "Image Upload Successful, compressing image")
        
    

def downloading(request):
    pass

def compressed_img (file,size):
    image=Image.open(file)
    image_path=file.path
    compressed_image_path = image_path.replace(".","_compressed.")
    image.save(compressed_image_path,quality=size)
    return compressed_image_path
