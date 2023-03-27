import { ActionEvent, Controller } from '@hotwired/stimulus'
import YouTubePlayer from 'youtube-player'

export default class extends Controller {
  containerTarget: HTMLDivElement
  thumbnailTarget: HTMLDivElement
  youtubeIdValue: string

  static targets = ['container', 'thumbnail']

  static values = {
    youtubeId: String,
  }

  async initialize() {
    this.thumbnailTarget.innerHTML += `<img src="https://img.youtube.com/vi/${this.youtubeIdValue}/maxresdefault.jpg"></img>`
  }

  open() {
    const modalContainerElement = document.querySelector('#modal-container')

    const movieEl = `
      <div class="modal modal-movie" data-controller="modal">
        <div class="modal__header">
          <button aria-label="閉じる" class="modal__close-button" data-action="modal#close" type="button">
            <svg aria-label="閉じる" fill="none" height="24" role="img" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 20L12 12M12 12L4 4M12 12L20 20M12 12L20 4" stroke-opacity="1" stroke-width="2" stroke="#ffffff"/>
            </svg>
          </button>
        </div>
        <div class="modal__content">
          <div id="movie-container"></div>
        </div>
      </div>
    `

    modalContainerElement.innerHTML = movieEl

    YouTubePlayer('movie-container', {
      width: '100%',
      videoId: this.youtubeIdValue,
      playerVars: {
        autoplay: 1,
      },
    })

    document.body.classList.add('is-presenting-modal')
  }
}
