import { PhotoSizeViewModel } from "../../posts/posts.view.models/photo.size.view.model";
import { BlogMainPhotoEntity } from "../../entities/photo.entities/blog.main.photo-entity";
import { BlogWallpaperPhotoEntity } from "../../entities/photo.entities/blog.wallpaper.photo-entity";

export class BlogImagesViewModel {

        wallpaper: PhotoSizeViewModel
        main: PhotoSizeViewModel[]  // nullable: true Must contain original photo size (940x432) and middle photo (300x180) and small (149x96)


    static create(blogsWallpaper: PhotoSizeViewModel, main: PhotoSizeViewModel[]) {
        const viewModel = new BlogImagesViewModel()
        viewModel.wallpaper = blogsWallpaper
        viewModel.main = main
        return viewModel
    }

    static getViewModel(blogsWallpaper: BlogWallpaperPhotoEntity, blogsMainImages: BlogMainPhotoEntity[]) {
        return {
            wallpaper : blogsWallpaper.url ? PhotoSizeViewModel.getViewModelForWallpaper(blogsWallpaper) : null,
            main : blogsMainImages.map(photo => PhotoSizeViewModel.getViewModelForMain(photo))
        };
    }
}