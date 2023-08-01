import { PhotoSizeViewModel } from "./photo.size.view.model";
import { PostMainPhotoEntity } from "../../entities/photo.entities/post.main.photo-entity";

export class PostImagesViewModel {
    main : PhotoSizeViewModel[]  // nullable: true Must contain original photo size (940x432) and middle photo (300x180) and small (149x96)
    static getViewModel(main: PostMainPhotoEntity[]) {
        const newImage = new PostImagesViewModel()

        newImage.main = main.map(item => PhotoSizeViewModel.getViewModelForPost(item))
        return newImage
    }
}