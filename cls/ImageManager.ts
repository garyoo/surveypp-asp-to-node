export default class ImageManager {
    private loadingImageUrl: string = 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/585d0331234507.564a1d239ac5e.gif';
    private imageUrls: Map<HTMLImageElement,string> = new Map();
    constructor (private $div: JQuery<HTMLDivElement>) {
    }
    checkImages()  {
        for(let img of this.imageUrls.keys()) {
            let image = new Image();
            image.onload = (evt) => {
                img.width = image.width;
                img.height = image.height;
                img.src = image.src;
            };
            image.onerror = () => {
                img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';
            };
            let checkImg = this.imageUrls.get(img);
            if(checkImg) image.src = checkImg;
        }
    }

    matchImages() {
        let images: Array<HTMLImageElement> = this.$div.find('img').map((index, domElement) => {
            return domElement as HTMLImageElement;
        }).get();

        for(let img of images) {
            this.imageUrls.set(img, img.src);
            img.width = 40;
            img.height = 40;
            img.src = this.loadingImageUrl;
        }

        this.checkImages();
    }


}