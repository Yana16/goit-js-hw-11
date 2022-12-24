import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { imgApiService } from "./js/getImg";
import { renderImgInfo } from "./js/renderHTML";

let getEl = selector => document.querySelector(selector);

getEl('.search-form').addEventListener('submit', onSearch);

getEl('.load-more').addEventListener('click', onLoadMore);

const imgApi = new imgApiService();

const lightbox = new SimpleLightbox('.gallery a', { captionsData: "alt", captionDelay: 250 });

function onSearch(e) {
    e.preventDefault();
    imgApi.query = e.currentTarget.elements.searchQuery.value;
    imgApi.resetPage();
    if (imgApi.query !== "") {
        getEl('.gallery').innerHTML = "";
        getEl('.load-more').style.visibility = "hidden";
    } else if (imgApi.query === "") {
        return Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
    }
    imgApi.getImage().then(data => {
        imgApi.totalHits = data.totalHits;
        renderGallery(data);
    }).catch(error => {
        console.log(error);
        Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
    })
}

function onLoadMore(e) {
    e.preventDefault();
    imgApi.page += 1;
    imgApi.decreaseTotalHits();
    imgApi.getImage().then(data => {
        if (imgApi.totalHits <= 40) {
            getEl('.load-more').style.visibility = "hidden";
            Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.")
        }
        renderGalleryAgain(data);
    }).catch(error => {
        console.log(error);
        Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
    })
}

function renderGalleryAgain(data) {
    if (data.totalHits > 0) {
        getEl('.gallery').insertAdjacentHTML('beforeend', renderImgInfo(data.hits));
        lightbox.refresh();
        Notiflix.Notify.success(`Hooray! We load more images.`);
    } else {
        Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
    }
}

function renderGallery(data) {
    if (data.totalHits < 40 && data.totalHits !== 0) {
        getEl('.gallery').insertAdjacentHTML('beforeend', renderImgInfo(data.hits));
        lightbox.refresh();
        return Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    } else if (data.totalHits > 0) {
        getEl('.gallery').insertAdjacentHTML('beforeend', renderImgInfo(data.hits));
        lightbox.refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        getEl('.load-more').style.visibility = "visible";
    } else {
        Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
    }
}