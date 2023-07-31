import { PhotoSizeViewModel } from "../../posts/posts.view.models/photo.size.view.model";
import { PhotoEntity } from "../../entities/photo-entity";

export class BlogImagesViewModel {
    images : {
        wallpaper: PhotoSizeViewModel
        main: PhotoSizeViewModel[]  // nullable: true Must contain original photo size (940x432) and middle photo (300x180) and small (149x96)
    }

    static create(blogsWallpaper: PhotoSizeViewModel, main: PhotoSizeViewModel[]) {
        const viewModel = new BlogImagesViewModel()
        viewModel.images.wallpaper = blogsWallpaper
        viewModel.images.main = main
        return viewModel
    }

    static getViewModel(blogsWallpaper: PhotoEntity, blogsMainImages: PhotoEntity[]) {
        return {
            wallpaper : PhotoSizeViewModel.getViewModel(blogsWallpaper),
            main : blogsMainImages.map(photo => PhotoSizeViewModel.getViewModel(photo))
        };
    }
}