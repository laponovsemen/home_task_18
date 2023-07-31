import { PhotoSizeViewModel } from "./photo.size.view.model";

export class PostImagesViewModel {
    main : PhotoSizeViewModel[]  // nullable: true Must contain original photo size (940x432) and middle photo (300x180) and small (149x96)
}