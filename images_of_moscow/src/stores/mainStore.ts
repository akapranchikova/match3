// do not nest functions, this will be bound to scope
import { getSubtitles } from "./subtitles.ts"
import {
  sub1_video,
  sub1_1,
  sub1_2,
  sub1_3,
  sub2_video,
  sub2_1,
  sub2_2,
  sub2_3,
  sub3_video,
  sub3_1,
  sub3_2,
  sub3_3,
} from "./subtitles-content.ts"

type Picture = "1" | "2" | "3"
type Point = "1" | "2" | "3"
// subStores do not content any functions, as it will not work
interface Player {
  playerMode: "video" | "picture"
  currentPicture: Picture
  currentPoint: Point
  videoTime: number
  audioTime: number
  pointTime: number
  isScaleHintShown: boolean
  currentPointState: "inactive" | "activePlaying" | "activePaused" | "hidden"
}

interface Intro {
  pageAfter: "videoplayer" | "gallery"
  innerPage: number
}
// Single picture progress
interface PictureProgress {
  isVideoDone: boolean
  pointsDone: Record<Point, boolean>
}

interface Progress {
  isIntroSeen: boolean
  pictures: Record<Picture, PictureProgress>
}

interface Store {
  progress: Progress
  queryPicture: string
  currentPage: "intro" | "player" | "gallery"
  intro: Intro
  player: Player
  isSoundOn: boolean
  isLoading: boolean
  qrCodeScanner: boolean
  isPlaying: boolean
  videoDuration: number
  audioDuration: number
  currentTime: number
  content: any
  currentSoundUrl: string
  bckgPicGrayscale: number
  videoRef: null | HTMLVideoElement
  audioRef: null | HTMLAudioElement
  handlePlayerClose: VoidFunction
  handleIntroNextClick: VoidFunction
  playVideo: VoidFunction
  setVideoRef: VoidFunction
  setAudioRef: VoidFunction
  onLoadedMetadata: VoidFunction
  onTimeUpdate: VoidFunction
  onEnded: VoidFunction
  getSubtitles: any
  handleRequestFullScreen: VoidFunction
  handleGoToPlayer: VoidFunction
  togglePlay: VoidFunction
  handlePlayerSwitchMode: (arg0: string) => void
  handlePlayerToggleMute: VoidFunction
  handlePointClick: (arg0: Point) => void
  getCurrentSubs: () => string
  getProgressFromLocalStorage: VoidFunction // LS -> Store
  setProgressToLocalStorage: VoidFunction // Store -> LS
  getQueryParam: VoidFunction
  getPointStyle: (arg0: Point) => void
  getPointIcon: (arg0: Point) => void
  onAppInit: VoidFunction
  isCurrentPictureDone: () => boolean
  dropCurrentPictureProgress: VoidFunction
  share: VoidFunction
  playNewAudio: VoidFunction
}

// states in sub stores, functions with prefixes
export function createStore() {
  const store: Store = {
    progress: {
      isIntroSeen: false,
      pictures: {
        "1": {
          isVideoDone: false,
          pointsDone: { "1": false, "2": false, "3": false },
        },
        "2": {
          isVideoDone: false,
          pointsDone: { "1": false, "2": false, "3": false },
        },
        "3": {
          isVideoDone: false,
          pointsDone: { "1": false, "2": false, "3": false },
        },
      },
    },
    queryPicture: "0",
    currentSoundUrl: "",
    content: {
      subs: {
        "1": [sub1_video, sub1_1, sub1_2, sub1_3],
        "2": [sub2_video, sub2_1, sub2_2, sub2_3],
        "3": [sub3_video, sub3_1, sub3_2, sub3_3],
      },
      points: {
        "1": [
          { id: "1", x: 30, y: 39 },
          { id: "2", x: 46, y: 40 },
          { id: "3", x: 62, y: 19 },
        ],
        "2": [
          { id: "1", x: 7, y: 60 },
          { id: "2", x: 40, y: 20 },
          { id: "3", x: 82, y: 65 },
        ],
        "3": [
          { id: "1", x: 10, y: 50 },
          { id: "2", x: 30, y: 50 },
          { id: "3", x: 80, y: 50 },
        ],
      },
      texts: {
        "1": {
          author: "Репин Илья Ефимович",
          title: "Заседание Государственного Совета",
          year: "1903",
          about: "Заседание",
        },
        "2": {
          author: "Суриков В.И.",
          title: "Степан Разин",
          year: "1906",
          about: "Девицы то нет",
        },
        "3": { author: "", title: "", year: "", about: "" },
      },
    },
    currentPage: "intro",
    isSoundOn: false,
    qrCodeScanner: false,
    isLoading: false,
    isPlaying: false,
    videoDuration: 0,
    audioDuration: 0,
    currentTime: 0,
    getSubtitles: getSubtitles,
    player: {
      isScaleHintShown: true,
      playerMode: "video",
      currentPicture: "1",
      currentPoint: "1",
      videoTime: 0,
      audioTime: 0,
      pointTime: 0,
      currentPointState: "inactive",
    },
    videoRef: null,
    audioRef: null,
    intro: {
      pageAfter: "videoplayer",
      innerPage: 1,
    },
    bckgPicGrayscale: 50,
    handleGoToPlayer() {
      this.currentPage = "player"
      if (this.player.playerMode === "video") {
        this.handlePlayerSwitchMode("video")
        this.playVideo()
      } else {
        this.handlePlayerSwitchMode("picture")
      }
    },
    handleIntroNextClick() {
      if (this.intro.innerPage === 4) {
        // runtime checking, unable to use types
        if (
          this.queryPicture === "1" ||
          this.queryPicture === "2" ||
          this.queryPicture === "3"
        ) {
          this.player.currentPicture = this.queryPicture
          this.handleGoToPlayer()
        } else {
          this.currentPage = "gallery"
        }
      }
      this.intro.innerPage++
    },
    setVideoRef() {
      this.videoRef = document.querySelector("#video")
    },
    setAudioRef() {
      this.audioRef = document.querySelector("#audio")
    },
    onLoadedMetadata() {
      if (this.player.playerMode === "video") {
        this.setVideoRef()
        if (this.videoRef) {
          this.videoDuration = this.videoRef.duration
          this.videoRef.muted = !this.isSoundOn
        }
      } else {
        this.setAudioRef()
        if (this.audioRef) {
          this.audioDuration = this.audioRef.duration
          this.audioRef.muted = !this.isSoundOn
        }
      }
    },
    onTimeUpdate() {
      dispatchEvent(
        new CustomEvent("time-updated", { detail: { time: this.currentTime } })
      )
      if (this.player.playerMode === "video") {
        this.setVideoRef()
        if (this.videoRef) {
          this.currentTime = this.videoRef.currentTime
        }
      } else {
        this.setAudioRef()
        if (this.audioRef) {
          this.currentTime = this.audioRef.currentTime
        }
      }
    },
    onEnded() {
      if (this.player.playerMode === "video") {
        this.progress.pictures[this.player.currentPicture].isVideoDone = true
        this.setProgressToLocalStorage()
        this.handlePlayerSwitchMode("picture")
      } else {
        this.progress.pictures[this.player.currentPicture].pointsDone[
          this.player.currentPoint
        ] = true
      }
      this.isPlaying = false
      this.setProgressToLocalStorage()
    },
    handlePlayerClose() {
      if (this.videoRef) {
        this.videoRef.pause()
      }
      if (this.audioRef) {
        this.player.currentPointState = "inactive"
        this.audioRef.pause()
        console.log("this.audioRef")
      }
      this.isPlaying = false
      this.currentPage = "gallery"
      this.intro.innerPage = 1
      this.isPlaying = false
    },
    handlePlayerSwitchMode(mode: string) {
      if (mode === "video") {
        this.bckgPicGrayscale = 70
        this.isPlaying = false
        this.player.playerMode = "video"
      } else {
        this.bckgPicGrayscale = 10
        if (this.audioRef) {
          this.audioRef.pause()
        }
        this.isPlaying = false
        this.player.playerMode = "picture"
      }
    },
    togglePlay() {
      if (this.player.playerMode === "video") {
        this.setVideoRef()
        if (this.videoRef) {
          this.videoRef.muted = !this.isSoundOn
          if (this.isPlaying) {
            this.isPlaying = false
            this.videoRef.pause()
          } else {
            this.isPlaying = true
            this.videoRef.play()
          }
        }
      } else {
        this.setAudioRef()
        if (this.audioRef) {
          if (this.isSoundOn) {
            this.audioRef.muted = false
          } else {
            this.audioRef.muted = true
          }
          if (this.isPlaying) {
            this.isPlaying = false
            this.audioRef.pause()
            this.player.currentPointState = "activePaused"
          } else {
            if (this.player.currentPointState === "inactive") {
              this.playNewAudio()
            } else {
              this.isPlaying = true
              this.audioRef.play()
            }
            this.player.currentPointState = "activePlaying"
          }
        }
      }
    },
    handlePlayerToggleMute() {
      if (this.player.playerMode === "video") {
        this.setVideoRef()
        if (this.videoRef) {
          if (!this.isSoundOn) {
            this.videoRef.muted = false
            this.isSoundOn = true
          } else {
            this.videoRef.muted = true
            this.isSoundOn = false
          }
        }
      } else {
        this.setAudioRef()
        if (this.audioRef) {
          if (!this.isSoundOn) {
            this.audioRef.muted = false
            this.isSoundOn = true
          } else {
            this.audioRef.muted = true
            this.isSoundOn = false
          }
        }
      }
    },
    handleRequestFullScreen() {
      const rootElement = document.documentElement
      rootElement.requestFullscreen()
      window.scrollTo(1, 0)
    },
    getCurrentSubs() {
      if (this.player.playerMode === "video") {
        return this.content.subs[this.player.currentPicture][0]
      } else {
        return this.content.subs[this.player.currentPicture][
          this.player.currentPoint
        ]
      }
    },
    playNewAudio() {
      this.player.currentPointState = "activePlaying"
      this.setAudioRef()
      if (this.audioRef) {
        // Remove any existing <source> elements
        this.audioRef.innerHTML = ""

        // Create a new <source> element
        const newSource = document.createElement("source")
        newSource.src =
          "/content/" +
          this.player.currentPicture +
          "/" +
          this.player.currentPoint +
          ".mp3"
        newSource.type = "audio/mpeg"

        // Append the new source and reload
        this.audioRef.appendChild(newSource)
        this.audioRef.load()
        this.audioRef.currentTime = 0
        this.audioRef.play()
        this.isPlaying = true
        if (this.isSoundOn) {
          this.audioRef.muted = false
        } else {
          this.audioRef.muted = true
        }
      }
    },
    handlePointClick(id) {
      if (this.player.playerMode === "video") {
        return
      }
      if (id === this.player.currentPoint) {
        if (this.player.currentPointState === "inactive") {
          this.playNewAudio()
        } else if (this.player.currentPointState === "activePlaying") {
          this.player.currentPointState = "activePaused"
          if (this.audioRef) {
            this.audioRef.pause()
            this.isPlaying = false
          }
        } else if (this.player.currentPointState === "activePaused") {
          this.player.currentPointState = "activePlaying"
          if (this.audioRef) {
            this.audioRef.play()
            this.isPlaying = true
          }
        }
      } else {
        this.player.currentPointState = "activePaused"
        if (this.audioRef) {
          this.audioRef.pause()
          this.isPlaying = false
        }
        this.player.currentPoint = id
        this.playNewAudio()
      }
    },
    playVideo() {
      if (this.player.playerMode === "video") {
        this.setVideoRef()
        if (this.videoRef) {
          this.videoRef.muted = !this.isSoundOn
          this.isPlaying = true
          this.videoRef.play()
        }
      }
    },
    getProgressFromLocalStorage() {
      const progressJSON = localStorage.getItem("progress")
      if (progressJSON === null) {
        this.setProgressToLocalStorage()
      } else {
        const progress = JSON.parse(progressJSON)
        this.progress = progress
      }
    },
    setProgressToLocalStorage() {
      const progressJSON = JSON.stringify(this.progress)
      localStorage.setItem("progress", progressJSON)
    },
    getQueryParam() {
      const urlParams = new URLSearchParams(window.location.search)
      const idParam = urlParams.get("id")
      console.log(idParam)
      //runtime check, no way to use types
      if (idParam) {
        this.queryPicture = idParam
      }
    },
    getPointStyle(id: Point) {
      let opacity: string = "1.0"
      let scale: string = "1.0"
      let transition: string = "0.8"
      let grayscale: string = this.progress.pictures[this.player.currentPicture]
        .pointsDone[id]
        ? "100"
        : "0"
      if (
        this.player.currentPoint === id &&
        this.player.currentPointState !== "inactive"
      ) {
        if (this.player.currentPointState === "activePlaying") {
          // active playing
          scale = "1.0"
          opacity = "1.0"
          transition = "0.0"
        } else {
          //active paused
          scale = "1.0"
          opacity = "1.0"
          transition = "0.0"
        }
      } else {
        //inactive
        scale = "0.5"
        opacity = "1.0"
        transition = "0.0"
      }
      return `transition: ${transition}s ease-in-out; touch-action: auto;transform: scale(${scale});opacity:${opacity};filter: grayscale(${grayscale}%)`
    },
    getPointIcon(id: Point) {
      return `/icons/${
        this.player.currentPoint === id &&
        this.player.currentPointState !== "inactive"
          ? this.player.currentPointState === "activePlaying"
            ? "point-sound-off"
            : "point-sound-on"
          : "point"
      }.svg`
    },
    isCurrentPictureDone() {
      const done =
        this.progress.pictures[this.player.currentPicture].isVideoDone &&
        Object.values(
          this.progress.pictures[this.player.currentPicture].pointsDone
        ).every((_) => _ === true)
      return done
    },
    dropCurrentPictureProgress() {
      this.progress.pictures[this.player.currentPicture].isVideoDone = false
      for (const key in this.progress.pictures[this.player.currentPicture]
        .pointsDone) {
        this.progress.pictures[this.player.currentPicture].pointsDone[
          key as Point
        ] = false // No error with proper typing
      }
      this.setProgressToLocalStorage()
    },
    share() {
      navigator.share({ title: document.title, url: window.location.href })
    },
    onAppInit() {
      this.getProgressFromLocalStorage()
      this.getQueryParam()
    },
  }
  return store
}
