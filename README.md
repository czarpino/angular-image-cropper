# Angular Image Cropper

Add a directive to turn image elements into croppers. Allows dragging and zooming in/out. Works with touch too -- I still need to work on the pinch, though.

## Usage

A demo is on the way. Regardless, here's a lazy usage reference:

    <div ng-init="cropImage='images/lenna.png'">
        <img crop-image="cropImage" crop-image-result="croppedImage">
        <img ng-src="{{ croppedImage() }}">
        <button ng-click="cropImageResult=croppedImage()">Crop</button>
    </div>

**Note:** Image element annotated with `crop-image` is replaced by a canvas which inherits the original element's dimensions.

## Installation

Install via Bower, downloading the source, or outright copy-pasting. The preferred way to install is with Bower:

    bower install czarpino/angular-image-cropper --save

Include the js file in your HTML below AngularJS:

    <script src="path/to/angular/angular.js"></script>
    <script src="path/to/angular-image-cropper/js/angular-image-cropper.js"></script>

And don't forget to include as module dependency:

    angular.module("appModule", ['cp.ng.crop-image']);

