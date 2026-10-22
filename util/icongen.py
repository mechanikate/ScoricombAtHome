from PIL import Image 
from viridis import viridis_data
import json, math

color_gen = lambda n, spread: tuple([int(255*x) for x in viridis_data[int((math.log2(n) if n > 0 else 0)/spread)]]+[0 if n <= 0 else 255])
img = Image.new(mode="RGBA", size=(128,128))
dataset = {}
with open("../prestored.json", "r") as f:
    print("Loading JSON...")
    j = json.load(f)
    print("done. Getting max a-b...")
    max_a, max_b = (max(k.split("-")[i] for k in j.keys()) for i in [0,1])
    min_l, max_l = 0, math.log2(max([len(v) for v in j.values()]))
    spread = (max_l-min_l+1)/256
    print("done. Getting path counts...")
    for branch_name,paths in j.items():
        a,b = tuple([int(x) for x in branch_name.split("-")])
        print(f"{a}-{b}... ", end="")
        cnt = len(paths)
        if a not in dataset:
            dataset[a] = {}
        print(a,b,cnt,math.log2(cnt)/spread if cnt>0 else 0, color_gen(cnt,spread))
        img.putpixel((a,b), color_gen(cnt,spread))
        print("done.")

img.save("raw.png", format="PNG")
img = img.crop(img.getbbox())
img.save("cropped.png", format="PNG")
img.resize((32,32))
img.save("favicon.ico", format="ICO")
