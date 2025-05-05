import base64
import cv2
import numpy as np
from ultralytics import YOLO
import logging

# Set up detailed logging
logging.basicConfig(level=logging.DEBUG, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('gesture_detection')

# Load the YOLO model with proper error handling
try:
    model = YOLO(r"detect\train\weights\best.pt")
    logger.info("Model loaded successfully! Available classes: %s", model.names)
except Exception as e:
    logger.error(f"Error loading the model: {e}")
    model = None

# This function links gesture logic to the existing Socket.IO server
def handle_gesture_sockets(sio):
    @sio.on("frame")
    async def handle_frame(sid, data):
        logger.info(f"Received frame from {sid}, processing...")
        
        if model is None:
            logger.error("Cannot process frame: model not loaded")
            await sio.emit("gesture_result", {"gesture": "Model Error", "error": True}, room=sid)
            return
            
        image_data = data.get("image")
        if not image_data:
            logger.warning("No image data received")
            return

        try:
            # Decode base64 image
            header, encoded = image_data.split(",", 1)
            img_bytes = base64.b64decode(encoded)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if frame is None or frame.size == 0:
                logger.warning("Failed to decode image")
                return
                
            logger.debug(f"Decoded frame with shape {frame.shape}")

            # Run YOLOv8 gesture detection
            logger.debug("Running YOLO prediction...")
            results = model.predict(frame, imgsz=256, conf=0.5)
            
            logger.debug(f"Prediction results: {len(results)} items")
            
            gesture_detected = None
            confidence = 0
            
            for r in results:
                logger.debug(f"Result has {len(r.boxes)} boxes")
                if len(r.boxes) > 0:
                    cls_id = int(r.boxes.cls[0])
                    confidence = float(r.boxes.conf[0])
                    gesture_detected = model.names[cls_id]
                    logger.info(f"Detected gesture: {gesture_detected} with confidence {confidence:.2f}")
                    break

            # Send back the result, even if no gesture was detected
            if gesture_detected:
                logger.info(f"Emitting gesture result to {sid}: {gesture_detected}")
                await sio.emit("gesture_result", {
                    "gesture": gesture_detected, 
                    "confidence": f"{confidence:.2f}"
                }, room=sid)
            else:
                logger.debug("No gesture detected in this frame")
                # Optionally send a "no gesture" result
                await sio.emit("gesture_result", {"gesture": "No gesture detected"}, room=sid)
                
        except Exception as e:
            logger.error(f"Error processing frame: {str(e)}", exc_info=True)
            await sio.emit("gesture_result", {"gesture": f"Error: {str(e)}", "error": True}, room=sid)