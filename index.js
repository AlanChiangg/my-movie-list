const BASE_URL = 'https://webdev.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/movies/'
const POSTER_URL = BASE_URL + 'posters/'
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const movies = []
let filteredMovies = []

axios
  .get(INDEX_URL)
  .then(res => {
    movies.push(...res.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch(error => {
    console.log(error)
  })

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

// sumbit事件監聽 (提交表單事件)
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 請瀏覽器終止元件的預設行為 (點擊input[type="submit"]預設會重新導向頁面)
  event.preventDefault()
  // 假設輸入值=keyword (去掉前後空白,全部轉為小寫字母)
  const keyword = searchInput.value.trim().toLowerCase()
  // 假設filteredMovies = 電影名稱有包含keyword的電影
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  // 如果filteredMovies長度為0, 代表沒有找到符合搜尋關鍵字的電影, 即顯示一個警示訊息
  if (filteredMovies.length === 0) {
    return alert('找不到有關(' + keyword + ')的電影名稱')
  }
  //重製分頁器
  renderPaginator(filteredMovies.length)
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) // Math.ceil無條件進位取整數
  let rawHTML = ''

  for (let page = 0; page < numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page + 1}>${page + 1}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    //需要修改title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>
  `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then(res => {
      const data = res.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
      <img src = "${POSTER_URL + data.image}"
    alt = "Movie-Poster" class="img-fluid" >
      `
    })
    .catch(error => {
      console.log(error)
    })
}

  function getMoviesByPage(page) {
  // page 1 -> movies 0 - 11
  // page 1 -> movies 12 - 23
  // ...
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
