# X-Smart
# Copyright (c) 2025 NEU-DreamChasers

# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import ee
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo GEE
try:
    ee.Initialize(ee.ServiceAccountCredentials(None, 'service-account.json'))
    print("✅ GEE Python Ready!")
except Exception as e:
    print(f"❌ GEE Error: {e}")

# --- HELPER FUNCTIONS ---
def to_db(img):
    return ee.Image(img).log10().multiply(10.0)

def to_natural(img):
    return ee.Image(10.0).pow(img.divide(10.0))

def get_roi():
    return ee.FeatureCollection('FAO/GAUL/2015/level1') \
            .filter(ee.Filter.eq('ADM1_NAME', 'Ho Chi Minh City')).geometry()

# --- LOGIC CỐT LÕI: TẠO ẢNH ĐỘ SÂU NGẬP ---
# Hàm này dùng chung cho cả việc lấy Layer và lấy số liệu tại điểm
def create_flood_depth_image():
    roi = get_roi()
    
    # 1. Sentinel-1
    collection = ee.ImageCollection('COPERNICUS/S1_GRD') \
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH')) \
        .filter(ee.Filter.eq('instrumentMode', 'IW')) \
        .select(['VH'])
    
    before = collection.filterDate('2023-04-01', '2023-04-30').mosaic().clip(roi)
    after = collection.filterDate('2023-10-15', '2023-10-30').mosaic().clip(roi)

    # Lọc nhiễu
    before_smooth = to_db(to_natural(before).focal_median(50, 'circle', 'meters'))
    after_smooth = to_db(to_natural(after).focal_median(50, 'circle', 'meters'))

    # Tính toán ngập
    diff = after_smooth.subtract(before_smooth)
    flooded = diff.gt(1.25).rename('flood')
    
    # Mask nước vĩnh viễn
    permanent_water = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').gt(50)
    flooded = flooded.updateMask(permanent_water.Not())
    
    # Lọc nhiễu hạt
    flooded = flooded.updateMask(flooded.connectedPixelCount(16).gte(16))

    # Tính độ sâu (Dùng DEM JAXA)
    dem = ee.Image("JAXA/ALOS/AW3D30/V2_2").select('AVE_DSM').clip(roi)
    
    # Logic: Độ sâu = (Độ cao max xung quanh 100m) - Độ cao điểm đó
    flood_depth = dem.focal_max(100, 'circle', 'meters') \
        .subtract(dem) \
        .updateMask(flooded) \
        .rename('depth') # Đặt tên band là 'depth'
    
    # Lọc giá trị ảo (chỉ lấy > 0)
    flood_depth = flood_depth.where(flood_depth.lt(0), 0)
    flood_depth = flood_depth.clamp(0, 1.5)
    
    return flood_depth

# --- API 1: LẤY LAYER MÀU (HEATMAP) ---
@app.get("/flood-layer")
def get_flood_layer():
    try:
        image = create_flood_depth_image()
        
        vis_params = {
            'min': 0, 'max': 1.2, 
            'palette': ['00FFFF', 'FFFF00', 'FF0000']
        }
        map_id = image.getMapId(vis_params)
        return {"url": map_id['tile_fetcher'].url_format}
    except Exception as e:
        return {"error": str(e)}

# --- API 2: LẤY ẢNH VỆ TINH SENTINEL-2 ---
@app.get("/satellite-layer")
def get_satellite_layer():
    try:
        roi = get_roi()
        # Lấy ảnh True Color ít mây nhất năm 2023
        s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(roi) \
            .filterDate('2023-01-01', '2023-12-31') \
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
            .median() \
            .clip(roi)

        vis_params = {
            'min': 0, 'max': 3000, 
            'bands': ['B4', 'B3', 'B2']
        }
        map_id = s2.getMapId(vis_params)
        return {"url": map_id['tile_fetcher'].url_format}
    except Exception as e:
        return {"error": str(e)}

# --- API 3: CHECK POINT (TÍNH TOÁN THẬT) ---
@app.get("/check-point")
def check_point(lat: float, lon: float):
    try:
        # Tái tạo ảnh độ sâu
        image = create_flood_depth_image()
        
        # Tạo điểm cần check
        point = ee.Geometry.Point([lon, lat])
        
        # Lấy giá trị tại điểm đó (dùng reduceRegion)
        # scale=30 tương ứng độ phân giải ALOS DEM
        info = image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=point.buffer(30),
            scale=30
        ).getInfo()

        depth = info.get('depth')

        if depth is None or depth == 0:
            return {"status": "An toàn", "depth": 0, "description": "Khu vực khô ráo"}
        
        depth = float(depth)
        
        # Phân loại mức độ
        status = "Ngập nhẹ"
        desc = "Xe máy di chuyển cẩn thận."
        
        if depth > 0.3: 
            status = "Ngập trung bình"
            desc = "Nước ngập nửa bánh xe. Hạn chế đi lại."
        if depth > 0.7: 
            status = "Ngập sâu nguy hiểm"
            desc = "Nguy cơ chết máy cao. Cấm phương tiện nhỏ."
        return {
            "status": status,
            "depth": round(depth, 2),
            "description": desc
        }

    except Exception as e:
        print(f"Check point error: {e}")
        return {"status": "Lỗi", "depth": 0, "description": "Không thể xác định"}