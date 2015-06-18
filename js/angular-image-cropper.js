(function (angular, document) {
    'use strict';
    
    angular.module("cp.ng.crop-image", []).directive('cropImage', [cropImage]);
    
    /**
     * Crop image directive definition.
     * 
     * @returns {object}
     */
    function cropImage() {
        return {
            restrict: 'A',
            template: '<canvas></canvas>',
            replace: true,
            scope: {
                'cropImage': '=',
                'cropImageResult': '='
            },
            link: function (scope, element, attrs) {
                var cropper = new Cropper(element[0]);
                scope.cropImageResult = cropper.getCroppedImage;
                
                scope.$watch('cropImage', function (newImage) {
                    cropper.setImageSrc(newImage);
                });
            }
        };
    }
    
    /**
     * Canvas image cropper.
     * 
     * @param {canvas} canvas Canvas object for manipulating
     *                        source image
     */
    function Cropper(canvas) {
        
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        /**
         * @type CanvasRenderingContext2D
         */
        var ctx = canvas.getContext("2d");
        
        /**
         * Point coordinates of drawing cursor.
         * 
         * @type Object
         */
        var paintCursor = {x:0, y:0};
        
        /**
         * Point coordinates of mouse.
         * 
         * @type Object
         */
        var mouseCursor = {x:0, y:0};
        
        /**
         * Zoom factor.
         * 
         * @type Number
         */
        var scale = 1.0;
        
        /**
         * Zoom increment/decrement steps.
         * 
         * @type Number
         */
        var scaleIncrement = 0.05;
        
        /**
         * Image element.
         * 
         * @type Image
         */
        var image;
        
        /**
         * Zoom-out max.
         * 
         * @type Number
         */
        var maxScale = 4.0;
        
        /**
         * Zoom-in max.
         * 
         * @type Number
         */
        var minScale = 0.25;
        
        /**
         * Ratio for pointer to image movement.
         * 
         * @type Number
         */
        var motionSensitivity = 2.0;
        
        /**
         * Distance between touch points (e.g. fingers)
         * when listening for events on mobile.
         * 
         * @type Number
         */
        var touchDistance;
        
        canvas.addEventListener('mousedown', onCanvasMouseDown, false);
        canvas.addEventListener('wheel', onCanvasMouseScroll, false);
        canvas.addEventListener('touchstart', onTouchStart, false);
        canvas.addEventListener('touchend', onTouchEnd, false);
        
        var self = this;
        self.getCroppedImage = getCroppedImage;
        self.setImageSrc = setImageSrc;
        self.repaint = repaint;
        
        return this;
        
        /**
         * Retrieve base64 encoded canvas image.
         * 
         * @returns {string}
         */
        function getCroppedImage() {
            return canvas.toDataURL();
        }
        
        /**
         * Set image to crop.
         * 
         * @param {String} imageSrc
         * @returns {Cropper}
         */
        function setImageSrc(imageSrc) {
            if (!imageSrc) {
                return self;
            }
            
            image = new Image();
            image.src = imageSrc;
            image.onload = function () {
                reset();
                computeCropperParams();
                repaint();
            };
            
            return self;
        }
        
        /**
         * Reset cropper params.
         * 
         * @returns {Cropper}
         */
        function reset() {
            mouseCursor = {x:0, y:0};
            scale = 1.0;
            
            return self;
        }
        
        /**
         * Compute image dependent cropper params.
         * 
         * @returns {Cropper}
         */
        function computeCropperParams() {
            
            /* If image is larger than canvas, then show center of
             * image in canvas area. Otherwise, center image inside
             * the canvas.
             */
            paintCursor.x = canvas.width < image.width ? Math.floor(image.width/2 - canvas.width/2) : -Math.floor(canvas.width/2 - image.width/2);
            paintCursor.y = canvas.height < image.height ? Math.floor(image.height/2 - canvas.height/2) : -Math.floor(canvas.height/2 - image.height/2);
            
            return self;
        }
        
        /**
         * Paint image onto canvas.
         * 
         * @returns {Cropper}
         */
        function paint() {
            ctx.drawImage(image,
                paintCursor.x, paintCursor.y, canvas.width * scale, canvas.height * scale,
                0, 0, canvas.width, canvas.height
            );
    
            return self;
        }
        
        /**
         * Repaint canvas.
         * 
         * @returns {Cropper}
         */
        function repaint() {
            ctx.clearRect (0, 0, canvas.width, canvas.height);
            paint();
            
            return self;
        }
        
        /**
         * @param {event} e
         * @returns {undefined}
         */
        function onCanvasMouseDown(e) {
            mouseCursor = {x:e.clientX, y:e.clientY};
            document.addEventListener('mousemove', onMouseDragAction);
            document.addEventListener('mouseup', onMouseUp);
        }
        
        /**
         * @param {event} e
         * @returns {undefined}
         */
        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseDragAction);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        /**
         * @param {event} e
         * @returns {undefined}
         */
        function onCanvasMouseScroll(e) {
            e.preventDefault();
            zoomImage(e.deltaX <= 0 && e.deltaY <= 0);
        }
        
        /**
         * @param {event} e
         * @returns {undefined}
         */
        function onMouseDragAction(e) {
            e.preventDefault();
            
            var dx = e.clientX - mouseCursor.x;
            var dy = e.clientY - mouseCursor.y;
            
            if (isInBoundary(dx, dy)) {
                moveImage(dx, dy);
            }
            
            mouseCursor = {x:e.clientX, y:e.clientY};
        }
        
        /**
         * @param {event} e
         * @returns {Boolean}
         */
        function onTouchStart(e) {
            if (2 <= e.targetTouches.length) {
                e.preventDefault();
                touchDistance = Math.sqrt(
                    Math.pow(e.targetTouches[0].screenX -  e.targetTouches[1].screenX, 2) +
                    Math.pow(e.targetTouches[0].screenY -  e.targetTouches[1].screenY, 2)
                );
                canvas.addEventListener('touchmove', onPinchAction, false);
                return false;
            }

            if (1 === e.targetTouches.length) {
                e.preventDefault();
                mouseCursor = {x:e.targetTouches[0].screenX, y:e.targetTouches[0].screenY};
                canvas.addEventListener('touchmove', onTouchMoveAction, false);
                return false;
            }
        }
        
        /**
         * @param {event} e
         * @returns {undefined}
         */
        function onTouchEnd(e) {
            e.preventDefault();
            canvas.removeEventListener('touchmove', onPinchAction);
            canvas.removeEventListener('touchmove', onTouchMoveAction);
        }
        
        /**
         * @param {event} e
         * @returns {undefined}
         */
        function onPinchAction(e) {
            e.preventDefault();
            if (2 <= e.changedTouches.length) {
                var touch1 = e.changedTouches[0];
                var touch2 = e.changedTouches[1];
                var newTouchDistance = Math.sqrt(Math.pow(touch1.screenX - touch2.screenX, 2) + Math.pow(touch1.screenY - touch2.screenY, 2));

                // reduce pinch sensitivity by 5x because
                // it scales too fast
                if (Math.abs(touchDistance - newTouchDistance) > 5) {
                    zoomImage(touchDistance < newTouchDistance);
                    touchDistance = newTouchDistance;
                }
            }
        }
        
        /**
         * @param {event} e
         * @returns {undefined}
         */
        function onTouchMoveAction(e) {
            e.preventDefault();

            if (1 === e.changedTouches.length) {
                var dx = e.targetTouches[0].screenX - mouseCursor.x;
                var dy = e.targetTouches[0].screenY - mouseCursor.y;

                if (isInBoundary(dx, dy)) {
                    moveImage(dx, dy);
                }

                mouseCursor = {x:e.targetTouches[0].screenX, y:e.targetTouches[0].screenY};
            }
         }
        
        /**
         * Move image.
         * 
         * @param {int} dx Change in horizontal position
         * @param {int} dy Change in vertical position
         * @returns {Cropper}
         */
        function moveImage(dx, dy) {
            paintCursor.x += -dx * motionSensitivity;
            paintCursor.y += -dy * motionSensitivity;
            repaint();

            return self;
        }
        
        /**
         * Zoom in/out the image.
         * 
         * @param {boolean} zoomIn Will zoom in when true,
         *                  will zoom out otherwise
         * @returns {Cropper}
         */
        function zoomImage(zoomIn) {
            var newScale = scale + (zoomIn ? -scaleIncrement : scaleIncrement);
            if (newScale >= minScale && newScale <= maxScale) {
                scale = newScale;
                repaint();
            }
            
            return self;
        }
        
        /**
         * Check whether image to draw is still inside boundary.
         * 
         * @param {int} dx Projected change in horizontal
         * @param {int} dy Projected change in vertical
         * @param {float} testScale Zoom scale
         * @returns {Boolean} True when still in boundary, false otherwise
         */
        function isInBoundary(dx, dy, testScale) {
            dx = dx || 0;
            dy = dy || 0;
            testScale = testScale || scale;
            
            var newX = paintCursor.x + -dx * motionSensitivity;
            var newY = paintCursor.y + -dy * motionSensitivity;
            
            var rightBorder = -canvas.width * testScale <= newX;
            var leftBorder = newX <= image.width;
            var bottomBorder = -canvas.height * testScale <= newY;
            var topBorder = newY <= image.height;
            
            return leftBorder && rightBorder && topBorder && bottomBorder;
        }
    }
})(window.angular, window.document);