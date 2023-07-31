import { PhotoSizeViewModel } from "../../posts/posts.view.models/photo.size.view.model";

export class BlogImagesViewModel {
    wallpaper : PhotoSizeViewModel
    main : PhotoSizeViewModel[]  // nullable: true Must contain original photo size (940x432) and middle photo (300x180) and small (149x96)
}