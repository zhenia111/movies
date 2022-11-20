'Use strict'

document.addEventListener('DOMContentLoaded', () => {

    const API_KEY = "8c8e1a50-6322-4135-8875-5d40a5420d86";
    const API_URL_POPULAR = "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1";
    const API_URL_SEARCH = "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
    const moviesWrapper = document.querySelector('.movies');
    const modalWindow = document.querySelector('.modal');
    const genresWrapper = document.querySelector('.search__items');
    const inputSearcher = document.querySelector('.header__search');
    const ratingWrapper = document.querySelector('.sub-rating');

    getMovies(API_URL_POPULAR);

    async function getMovies(url) {
        const resp = await fetch(url, {
            headers: {
                'Content-Type': "application/json",
                'X-API-KEY': API_KEY,
                // 'Access-toren':    
            },
        });
        const respData = await resp.json();

        localStorage.removeItem("prevGenre");
        localStorage.removeItem("prevRating");

        console.log(respData.films);
        showMovies(respData.films);
        let uniqueGenres = getUniqueGenres(respData.films);
        renderGenresItems(uniqueGenres);
        renderRatingItems();
        allEventListeners(respData.films);
    }

    function showMovies(data) {
       let arrMoviesHTML = [];
        data.forEach((item) => {

            let genresMovie = findgenres(item.genres);
            let ratingMovie = getRatingClass(item.rating);

            arrMoviesHTML.push(`
            <div data-Id='${item.filmId}' class="movie">
                <div class="movie__cover-inner">
                    <img src=${item.posterUrlPreview} alt="${item.nameRu}" class="movie__cover">
                    <div class="movie__cover--darkened"></div>
                </div>
                <div class="movie__info">
                    <div class="movie__title">${item.nameRu}</div>
                    <div class="movie__category">${genresMovie}</div>
                <div class="movie__average ${ratingMovie}">${item.rating}</div>
                 </div>
            </div>
            `);
            moviesWrapper.innerHTML = arrMoviesHTML.join('');
        });
    }

    function findgenres(genres) {
        let allGenres = '';
        genres.forEach((item, i, arr) => {
            if (i + 1 == arr.length) {
                allGenres += `${item.genre}`;
            } else {
                allGenres += `${item.genre}, `;
            }
        });
        return allGenres;
    }

    function getRatingClass(rating) {
        let classRating = '';
        if (rating > 0 && rating < 5) {
            classRating = 'movie__average--red';
        } else if (rating >= 5 && rating < 7) {
            classRating = 'movie__average--orange';
        } else {
            classRating = 'movie__average--green';
        }
        return classRating;
    }

    function getCountries(countries) {
        let country = ''
        countries.forEach((item, i, arr) => {
            if (i + 1 == arr.length) {
                country += `${item.country}`;
            } else {
                country += `${item.country}, `;
            }
        })
        return country;
    }

    function renderModalCard(data, id) {
        let filtedMovieById = data.filter(item => item.filmId == id);
        filtedMovieById.forEach(item => {
            let genresMovie = findgenres(item.genres);
            let ratingMovie = getRatingClass(item.rating);
            let countryMovie = getCountries(item.countries);
            modalWindow.innerHTML = `
            <div class="modal__card">
                <div class="modal__header">
                    <img class="modal__img" src=${item.posterUrlPreview} alt="asfs">
                    <div class="modal__close">X</div>
                    <div class="movie__average ${ratingMovie} ">${item.rating}</div>
                </div>
                <div class="modal__descr">
                    <ul class="modal__list">
                        <li><strong>Название:</strong> ${item.nameRu}</li>
                        <li><strong>Жанры:</strong> ${genresMovie}</li>
                        <li><strong>Год выпуска:</strong> ${item.year}</li>
                        <li><strong>Страна:</strong> ${countryMovie}</li>
                    </ul>
                </div>
            </div>
            `;
        })
    }

    function openModalCard(modal) {
        modal.classList.add('modal__show');
        modal.classList.remove('modal__hide');
        document.body.style.overflow = 'hidden';
    }

    function closeModalCard(modal) {
        modal.classList.add('modal__hide');
        modal.classList.remove('modal__show');
        document.body.style.overflow = '';
    }

    function getUniqueGenres(data) {
        const arrOnlyGenres = data.map(item => item.genres);
        const arrGenres = [];
        for (let i = 0; i < arrOnlyGenres.length; i++) {
            for (let j = 0; j < arrOnlyGenres[i].length; j++) {
                if (!arrGenres.includes(arrOnlyGenres[i][j].genre)) {
                    arrGenres.push(arrOnlyGenres[i][j].genre);
                }
            }
        }
        console.log(arrGenres);
        return arrGenres;
    }

    function renderGenresItems(arr) {
        arr.forEach((item, i) => {
            genresWrapper.innerHTML += `
        <div data-id= ${i + 1}  class="search__item">${item}</div>
        `;
        })
    }

    function renderRatingItems() {
        const ratingWrapper = document.querySelector('.sub-rating');
        let arrRatingItems =[];
        
        for (let i = 1; i < 10; i++) {
            arrRatingItems.push(`
            <li>
              <a data-rating="${i}" class="sub-rating__link" href="">выше ${i}</a>
            </li>
            `);  
        }
        ratingWrapper.innerHTML += arrRatingItems.join('');
    }

    function allEventListeners(data) {

        moviesWrapper.addEventListener('click', (e) => {
            if (e.target.closest('.movie')) {
                const movieItem = e.target.closest('.movie');
                filmId = movieItem.getAttribute('data-Id');
                openModalCard(modalWindow);
                renderModalCard(data, filmId);
            }
        });

        modalWindow.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModalCard(modalWindow);
            }
            if (e.target.classList.contains('modal__close')) {
                closeModalCard(modalWindow);
            }

        });

        document.addEventListener('keydown', (e) => {
            if (e.key == 'Escape') {
                closeModalCard(modalWindow);
            }
        });

        const ratingLink = document.querySelector('.rating__link ');
        ratingLink.addEventListener('click', (e) => {
            e.preventDefault();
        });

        const btnSearcher = document.querySelector('.header__btn');
        btnSearcher.addEventListener('click', (e) => {
            e.preventDefault();
            combineFilter(data);
        });

        genresWrapper.addEventListener('click', (e) => {
            const genresItems = document.querySelectorAll('.search__item');
            if (e.target.classList.contains('search__item')) {
                // let prevGenre = null;
                genresItems.forEach(item => {
                    if (item.classList.contains("active")) {
                        localStorage.setItem("prevGenre", localStorage.getItem("prevGenre") ? item.innerHTML : true);//  или "все"
                    }
                    item.classList.remove("active");
                })
                e.target.classList.add("active");
                combineFilter(data);

            }
        });

        ratingWrapper.addEventListener('click', (e) => {
            e.preventDefault();
            const ratingItems = document.querySelectorAll('.sub-rating__link');
            if (e.target.classList.contains('sub-rating__link')) {

                ratingItems.forEach(item => {
                    if (item.classList.contains('active')) {
                        if (item.innerHTML == 'любой') {
                            localStorage.setItem('prevRating', localStorage.getItem('prevRating') ? item.innerHTML : true);
                        } else {
                            let ratingValueArr = item.innerHTML.split(' ');
                            let ratingValue = ratingValueArr[1];
                            localStorage.setItem('prevRating', localStorage.getItem('prevRating') ? ratingValue : true);
                        }

                    }
                    item.classList.remove('active');
                });
                e.target.classList.add('active');
                combineFilter(data);
            }
        })

        const sliderValue = document.querySelector('#volume');
        const inputSlider = document.querySelector('.slider-rating__input');

        inputSlider.oninput = (() => {
            let value = inputSlider.value;
            sliderValue.textContent = value;
            
            sliderValue.style.left = value*53 + 'px';
            

            let filtedMovies = data.filter(item => item.rating > value);
            if(!filtedMovies.length){
                alert('Нет фильмов с таким рейтингом . Этот Рейтинг отдельный не работает в общем фильтре');
            } else{
                
                showMovies(filtedMovies);
            }
            
        });

    }


    function combineFilter(data) {
        let res = [...data];
        res = filterBySearchValue(res);
        res = filterMoviesByGenres(res);
        if (!Array.isArray(res)) {
            returnPrevGenre(localStorage.getItem("prevGenre"));
            combineFilter(data);
            return;
        }
        res = filterMoviesByRating(res);
        if (!Array.isArray(res)) {
            returnPrevRating(localStorage.getItem('prevRating'));
            combineFilter(data);
            return;
        }
        showMovies(res);
    }

    function filterBySearchValue(data) {
        if (inputSearcher.value == '') {
            return data;
        } else {
            let filterMoviesByInput = data.filter(item => (item.nameRu.toLowerCase().indexOf(inputSearcher.value) != -1));
            if (filterMoviesByInput.length == 0) {
                alert(`Фильмы по запросу "${inputSearcher.value}" не найдены!!`);
                return data;
            } else {
                return filterMoviesByInput;
            }
        }
    }

    function filterMoviesByGenres(data) {
        let selectGenre = '';
        const genresItems = document.querySelectorAll('.search__item');
        genresItems.forEach(item => {
            if (item.classList.contains("active")) {
                selectGenre = item.innerHTML;
            };
        });
        if (selectGenre == "Все") {
            return data;
        }

        const arrCoincidencesOfGenres = [];
        for (let i = 0; i < data.length; i++) {
            let arrOfGenres = data[i].genres;
            for (let j = 0; j < arrOfGenres.length; j++) {
                if (arrOfGenres[j].genre == selectGenre) {
                    arrCoincidencesOfGenres.push(data[i]);
                    break;
                }
            }
        }
        if (!arrCoincidencesOfGenres.length) {
            alert('Фильмов с такими жанрами нет');
            return "Something was wrong!";
        } else {
            return arrCoincidencesOfGenres;
        }
    }

    function filterMoviesByRating(data) {
        const ratingItems = document.querySelectorAll('.sub-rating__link');
        let moviesRating = '';
        ratingItems.forEach((item) => {

            if (item.classList.contains('active')) {
                moviesRating = item.getAttribute('data-rating');
            }
        });
        if (moviesRating == 'all') {
            return data;
        }
        let filtedArrByRating = data.filter(item => (item.rating > moviesRating));
        if (!filtedArrByRating.length) {
            alert('фильмов с таким рейтингом нет ');
            return 'There are not movies with this rating';
        } else {
            return filtedArrByRating;
        }
    }

    function returnPrevGenre(prevGenre) {
        const genresItems = document.querySelectorAll('.search__item');
        genresItems.forEach(item => {
            item.classList.remove("active");
        });
        genresItems.forEach(item => {
            if (item.innerHTML == prevGenre) {
                item.classList.add("active");
            }
        })
    }

    function returnPrevRating(prevRating) {
        const ratingItems = document.querySelectorAll('.sub-rating__link');
        ratingItems.forEach(item => {
            item.classList.remove('active');
        });
        ratingItems.forEach(item => {
            let ratingValueArr = item.innerHTML.split(' ');
            let ratingValue = ratingValueArr[1];
            if (item.innerHTML == prevRating || ratingValue == prevRating) {
                item.classList.add('active');
            }
        })
    }

});