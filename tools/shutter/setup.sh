#!/bin/sh
# Shutter's kit: reinstalls what the photo and measuring scripts need (each container starts fresh).
# Licences: rembg (MIT), onnxruntime (MIT), Pillow (HPND), numpy (BSD), requests (Apache-2.0). Run, never shipped.
pip install -q rembg onnxruntime pillow numpy requests
# rembg downloads its IS-Net model (isnet-general-use.onnx) to ~/.u2net on first use.
