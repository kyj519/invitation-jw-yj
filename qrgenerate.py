import qrcode
from PIL import Image

url = "https://kyj519.github.io/invitation-jw-yj/"

qr = qrcode.QRCode(
    version=2,  # 정보 많으면 살짝 키워도 됨
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=24,  # 원래 10이었는데 크게
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# QR 생성 (골드쪽에 어울리는 짙은 갈색)
img = qr.make_image(fill_color="#4d360f", back_color="#ffffff").convert("RGBA")

# 흰색을 투명으로 바꿈
datas = img.getdata()
new_data = []
for item in datas:
    if item[0] > 250 and item[1] > 250 and item[2] > 250:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

img.putdata(new_data)

# 필요하면 여기서 더 키우기 (예: 2000x2000)
# 원본 크기 확인
w, h = img.size
target = 2000  # 원하는 해상도
scale = target // max(w, h)
if scale > 1:
    img = img.resize((w * scale, h * scale), Image.NEAREST)

img.save("qrcode_transparent.png")