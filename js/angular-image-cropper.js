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
                scope.$watch('cropImage', function () {
                    scope.cropImageResult = new Cropper(scope.cropImage, element[0], scope);
                });
            }
        };
    }
    
    /**
     * Image cropper object definition.
     * 
     * @param {string} imageSource The image to be cropped
     * @param {canvas} canvas A canvas object to be used for manipulating the image
     * @returns {function} Returns a function that can be invoked to retrieve the cropped image
     */
    function Cropper(imageSource, canvas) {
        var image = new Image();
        var ctx = canvas.getContext("2d");
        var scale, scaleIncrement, maxScale, minScale;
        var sensitivity = 2;
        var canvasCursor = {x:0, y:0};
        var mouseCursor = {x:0, y:0};
        
        Cropper();
        
        return getCroppedImage;
        
        /**
         * Constructor
         */
        function Cropper() {
            image.src = imageSource;
            image.onload = function () {
                scale = 1.01;
                scaleIncrement = 0.1;
                minScale = canvas.width / image.width;
                maxScale = image.width / canvas.width;
                canvasCursor.x = Math.floor(image.width / 3);
                canvasCursor.y = Math.floor(image.height / 3);
                paint();
            };
            
            canvas.addEventListener('mousedown', function (e) {
                mouseCursor = {x:e.clientX, y:e.clientY};
                document.addEventListener('mousemove', onMouseDragAction);
                document.addEventListener('mouseup', function () {
                    document.removeEventListener('mousemove', onMouseDragAction);
                    document.removeEventListener('mouseup', this);
                });
            }, false);
            
            canvas.addEventListener('wheel', function (e) {
                e.preventDefault();
                zoomImage(e.deltaX <= 0 && e.deltaY <= 0);
            }, false);
            
            canvas.addEventListener('touchstart', function (e) {
                mouseCursor = {x:e.targetTouches[0].screenX, y:e.targetTouches[0].screenY};
                document.addEventListener('touchmove', onTouchMoveAction);
                document.addEventListener('touchend', function (e) {
                    document.removeEventListener('touchmove', onTouchMoveAction);
                    document.removeEventListener('touchend', this);
                });
            });
            
            // TODO touch pinch listener for zoom in/out
        }
        
        /**
         * On mouse drag logic.
         * 
         * @param {event} e
         */
        function onMouseDragAction(e) {
            var dx = e.clientX - mouseCursor.x;
            var dy = e.clientY - mouseCursor.y;
            
            moveImage(dx * sensitivity, dy * sensitivity);
            mouseCursor = {x:e.clientX, y:e.clientY};
        }
        
        function onTouchMoveAction(e) {
            e.preventDefault();
            if (1 === e.changedTouches.length) {
                var dx = e.targetTouches[0].screenX - mouseCursor.x;
                var dy = e.targetTouches[0].screenY - mouseCursor.y;
                mouseCursor = {x:e.targetTouches[0].screenX, y:e.targetTouches[0].screenY};
                moveImage(dx * sensitivity, dy * sensitivity);
            }
        }
        
        /**
         * Move image.
         * 
         * @param {int} dx Change in horizontal position
         * @param {int} dy Change in vertical position
         */
        function moveImage(dx, dy) {
            if (isInBoundary(dx, dy)) {
                canvasCursor.x += -dx;
                canvasCursor.y += -dy;
                paint();
                
                return true;
            }
            
            return false;
        }
        
        /**
         * Zoom in/out the image.
         * 
         * @param {boolean} zoomIn Will zoom in when true,
         *                  will zoom out otherwise
         */
        function zoomImage(zoomIn) {
            scale += zoomIn ? -scaleIncrement : scaleIncrement;
            if (isInBoundary(0, 0) && scale >= minScale && scale <= maxScale) {
                paint();
                return;
            }
            scale -= zoomIn ? -scaleIncrement : scaleIncrement;
        }
        
        /**
         * Check whether image to draw is still inside boundary.
         * 
         * @param {int} dx Projected change in horizontal
         * @param {int} dy Projected change in vertical
         * @returns {Boolean} True when still in boundary, false otherwise
         */
        function isInBoundary(dx, dy) {
            var newTopX = canvasCursor.x + (-dx || 0);
            var newTopY = canvasCursor.y + (-dy || 0);
            
            var leftBorder = 0 < newTopX;
            var rightBorder = newTopX + canvas.width * scale < image.width;
            var topBorder = 0 < newTopY;
            var bottomBorder = newTopY + canvas.height * scale < image.height;
            
            return leftBorder && rightBorder && topBorder && bottomBorder;
        }
        
        /**
         * Draw image in canvas.
         */
        function paint() {
            ctx.drawImage(image,
                canvasCursor.x, canvasCursor.y, canvas.width * scale, canvas.height * scale,
                0, 0, canvas.width, canvas.height
            );
        }
        
        /**
         * Retrieve base64 encoded canvas image.
         * 
         * @returns {string}
         */
        function getCroppedImage() {
            return canvas.toDataURL();
        }
    }
})(window.angular, window.document);