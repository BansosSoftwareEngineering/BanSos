FROM python:3.11-slim

WORKDIR /app

# Dependensi sistem untuk geopandas dan shapely
RUN apt-get update && apt-get install -y \
    build-essential \
    libgeos-dev \
    libgdal-dev \
    gdal-bin \
    libspatialindex-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY datasource/ ./datasource/

# Hugging Face Spaces menggunakan port 7860
EXPOSE 7860

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "7860"]
