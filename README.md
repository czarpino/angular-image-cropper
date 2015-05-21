# Angular Image Cropper

Add a directive to turn an image element into an image cropping canvas! Drag around and zoom in or out.

## Usage

Here's a lazy usage reference:

    <div ng-init="cropImage='images/lenna.png'">
        <img crop-image="cropImage" crop-image-result="croppedImage">
        <img ng-src="{{ croppedImage() }}">
        <button ng-click="cropImageResult=croppedImage()">Crop</button>
    </div>

Note that the image element annotated with `crop-image` is replaced by a canvas which inherits the original element's dimensions.

A makeshift demo is available via RawGit:

    https://cdn.rawgit.com/czarpino/angular-image-cropper/<<last-commit-sha>>/demo.html

Replace `<<lasy-commit-sha>>` with, well, the last commit sha in the repo e.g.

    https://cdn.rawgit.com/czarpino/angular-image-cropper/010dde65798d008beffadef4f8c899e8058e7806/demo.html

## Installation

Install via Bower, downloading the source, or outright copy-pasting. The preferred way to install is with Bower:

    bower install czarpino/angular-image-cropper --save

Include the js file in your HTML below AngularJS:

    <script src="path/to/angular/angular.js"></script>
    <script src="path/to/angular-image-cropper/js/angular-image-cropper.js"></script>

And don't forget to include as module dependency:

    angular.module("appModule", ['cp.ng.crop-image']);

