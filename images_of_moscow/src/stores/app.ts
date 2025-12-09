import { type DialogueNode, type Paint, type Point, paints } from "./paints.ts"
import { type Quiz, quizContent } from "./quiz.ts"
import { introSubtitles, getSubtitles } from "./subtitles.ts"

type appState =
  | "splash"
  | "onboard"
  | "scene"
  | "quiz"
  | "paint"
  | "player"
  | ""

interface Player {
  playerMode: "video" | "picture"
  currentNode: number
  currentNodeGuide: number
  currentPoint: number
  videoTime: number
  audioTime: number
  pointTime: number
  isScaleHintShown: boolean
  currentPointState: "inactive" | "activePlaying" | "activePaused" | "hidden"
  isFinished: boolean
  speed: "1" | "1.5" | "2"
  isFooterVisible: boolean
  currentSubtitles: string
  currentActivePoint: number
  nodeToReturn: number
  blockFooter: boolean
  isPaintStarted: boolean
  isPreloading: boolean
  pointsReady: boolean
  videoReady: boolean
}

interface Store {
  init: (...args: any[]) => any

  currentPage: appState
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
  videoRef: null | HTMLVideoElement
  videoRefBack: null | HTMLVideoElement
  audioRef: null | HTMLAudioElement
  introStep: number
  paints: Paint[]
  currentPaint: number
  currentNodeData: Function
  quiz: Quiz

  isImagesLoading: boolean

  pointVideoSource: () => string

  quizCurrentQuestion: VoidFunction
  quizRestart: VoidFunction
  quizAnswer: (num: number) => void

  restartPaint: VoidFunction
  playPausePaintNode: (action?: string) => void
  changePaintNodeSpeed: VoidFunction
  exit: VoidFunction

  showPlayerFooter: VoidFunction
  togglePlayerFooter: VoidFunction
  startNodeVideos: VoidFunction
  allPointsFinished: () => boolean
  goToNextPaint: VoidFunction

  introNextStep: VoidFunction
  playVideo: VoidFunction
  setVideoRef: VoidFunction
  setAudioRef: VoidFunction
  onLoadedMetadata: VoidFunction
  onTimeUpdate: VoidFunction
  onEnded: VoidFunction
  getSubtitles: any

  // handleRequestFullScreen: VoidFunction
  // handlePlayerClose: VoidFunction
  // handleGoToPlayer: VoidFunction
  // togglePlay: VoidFunction
  // handlePlayerSwitchMode: (arg0: string) => void
  // handlePlayerToggleMute: VoidFunction

  handlePointClick: (arg0: number) => void
  getCurrentSubs: () => string
  // getProgressFromLocalStorage: VoidFunction // LS -> Store
  // setProgressToLocalStorage: VoidFunction // Store -> LS
  // getQueryParam: VoidFunction
  getPointStyle: (arg0: number) => void
  onAppInit: VoidFunction
  // isCurrentPictureDone: () => boolean
  // dropCurrentPictureProgress: VoidFunction
  paintData: Function
  share: VoidFunction
  // playNewAudio: VoidFunction

  saveGlobalProgress: (paintId: number) => void
  showPointsHint: boolean
  showPlayerHint: boolean

  startSplash: VoidFunction
  initOnboard: VoidFunction
  goToScan: VoidFunction

  goToNextNode: (id?: number, fromPoint?: boolean) => void
  isIOS: Function

  launchIntroSubtitile: VoidFunction
  introCurrentSubtitles: string
  introSubtitlesTimer: NodeJS.Timeout | null
  introArtAnimated: boolean

  mainButtonActive: boolean
  speedButtonActive: boolean
  playButtonActive: boolean

  paintInit: VoidFunction
  closeInPaint: VoidFunction

  sliderTouchStart: () => void
  sliderTouchEnd: () => void
  sliderVal: number

  hideHints: VoidFunction
  startPaintGame: VoidFunction

  zoomToPoint: (point: Point, callback?: VoidFunction) => void
  zoomReverse: VoidFunction
}

export const appStore: Store = {
  isSoundOn: false,
  qrCodeScanner: false,
  currentPage: "",
  introStep: 1,
  isLoading: false,
  isPlaying: false,
  currentPaint: 0,
  currentTime: 0,
  isImagesLoading: false,
  player: {
    isScaleHintShown: true,
    playerMode: "video",
    currentNode: 1,
    currentNodeGuide: 1,
    currentPoint: 1,
    videoTime: 0,
    audioTime: 0,
    pointTime: 0,
    currentPointState: "inactive",
    isFinished: false,
    speed: "1",
    isFooterVisible: true,
    currentSubtitles: "",
    currentActivePoint: 0,
    nodeToReturn: 0,
    blockFooter: false,
    isPaintStarted: false,
    isPreloading: true,
    pointsReady: false,
    videoReady: false,
  },
  paints: paints,
  quiz: {
    questions: quizContent,
    currentQuestion: 0,
    score: 0,
    finished: false,
    finishAnimated: false,
    highlightQuizAnswer: {
      num: -1,
      style: "",
    },
  },
  content: {
    subs: {},
    points: {
      1: [
        { id: "1", x: 30, y: 39 },
        { id: "2", x: 46, y: 40 },
        { id: "3", x: 62, y: 19 },
      ],
      2: [
        { id: "1", x: 7, y: 60 },
        { id: "2", x: 40, y: 20 },
        { id: "3", x: 82, y: 65 },
      ],
      3: [
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
  currentSoundUrl: "",

  showPointsHint: true,
  showPlayerHint: false,

  videoRef: null,
  videoRefBack: null,
  audioRef: null,
  videoDuration: 0,
  audioDuration: 0,

  introArtAnimated: false,
  introCurrentSubtitles: "",
  introSubtitlesTimer: null,

  mainButtonActive: false,
  speedButtonActive: false,
  playButtonActive: false,

  sliderVal: 0,

  paintInit() {
    this.player.pointsReady = false
    loadAllImages(this.currentPaint, this.paintData().dialogue, () => {
      this.player.isPreloading = false
      this.player.videoReady = true
    })
    // checkAllVideosLoaded()
    let hideHints = sessionStorage.getItem("vdnhHideHints")
    if (hideHints === "1") this.showPointsHint = false
  },

  init() {
    let route = getQsParam("r")
    if (route === "quiz") this.currentPage = "quiz"
    else if (route === "player") this.currentPage = "player"
    else if (route === "paint") {
      this.currentPage = "paint"
      let id = getQsParam("pid")
      if (id !== undefined && id !== null) this.currentPaint = parseInt(id)
      this.paintInit()
    } else {
      // let skipIntro = localStorage.getItem("introFinished") === "1"
      let skipIntro = false
      if (skipIntro) {
        // this.goToScan()
        // TMP: гоняем на 4-й картине
        this.currentPage = "paint"
        this.currentPaint = 4
        this.paintInit()
      } else {
        this.currentPage = "splash"
        this.startSplash()
      }
    }
  },

  share() {
    navigator.share({ title: document.title, url: window.location.href })
  },

  onAppInit() {
    // this.getProgressFromLocalStorage();
  },
  introNextStep() {
    if (this.introStep === 5) {
      let video = document.getElementById("onboard-video") as HTMLVideoElement
      video.pause()

      this.goToScan()
      localStorage.setItem("introFinished", "1")

      return false
    }
    this.introArtAnimated = false
    this.introStep++
    this.mainButtonActive = true
    setInterval(() => {
      this.mainButtonActive = false
      this.introArtAnimated = true
    }, 300)

    if (this.introStep === 5) {
      this.launchIntroSubtitile()
    }
  },

  showPlayerFooter() {
    if (this.isPlaying && !this.player.blockFooter)
      this.player.isFooterVisible = true
  },

  togglePlayerFooter() {
    if (!this.player.blockFooter)
      this.player.isFooterVisible = !this.player.isFooterVisible
    if (this.player.isFooterVisible) {
      this.showPlayerHint = false
    }
    sessionStorage.setItem("showPlayerHintDisabled", "1")
  },

  setVideoRef() {
    this.videoRef = document.querySelector("#paint-video-guide")
    this.videoRefBack = document.querySelector("#paint-video")
  },
  setAudioRef() {
    this.audioRef = document.querySelector("#audio")
  },
  getSubtitles: getSubtitles,
  getCurrentSubs() {
    if (this.currentPaint === 0) return []
    if (this.player.playerMode === "video") {
      return this.content.subs[this.currentPaint][0]
    } else {
      return this.content.subs[this.currentPaint][this.player.currentPoint]
    }
  },
  getPointStyle(id: number) {
    let opacity: string = "1.0"
    let scale: string = "1.0"
    let transition: string = "0.8"
    let grayscale: string = "0"
    if (this.currentNodeData().pointsOfInterest !== undefined) {
      grayscale = this.currentNodeData().pointsOfInterest.find(
        (point: Point) => {
          return point.id === id
        }
      ).finished
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
        scale = "1.0"
        opacity = "1.0"
        transition = "0.0"
      }
    }
    return `transition: ${transition}s ease-in-out; touch-action: auto;transform: scale(${scale});opacity:${opacity};filter: grayscale(${grayscale}%)`
    // return `transition: ${transition}s ease-in-out; touch-action: auto;transform: scale(${scale});opacity:${opacity};`
  },

  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  },

  startSplash() {
    if (getQsParam("r") == null) {
      loadIntroImages(() => {
        let v = document.getElementById("intro-video-preload")
        this.currentPage = "onboard"
        setInterval(() => {
          this.introArtAnimated = true
        }, 300)
        v?.addEventListener("canplaythrough", () => {
          console.log("intro canplaythrough!")
        })
      })
    }
  },

  initOnboard() {
    this.introStep = 1
    setTimeout(() => {
      // this.introStep = 2
      this.introNextStep()
    }, 6000)
  },

  launchIntroSubtitile() {
    let video = document.getElementById("onboard-video") as HTMLVideoElement
    video.playbackRate = 1.15
    video.defaultPlaybackRate = 1.15
    video.play()

    this.introCurrentSubtitles = getSubtitles(
      introSubtitles[0].text,
      video.currentTime
    )
    this.introSubtitlesTimer = setInterval(() => {
      this.introCurrentSubtitles = getSubtitles(
        introSubtitles[0].text,
        video.currentTime
      )
    }, 100)
    video.addEventListener("ended", () => {
      if (this.introSubtitlesTimer !== null)
        clearInterval(this.introSubtitlesTimer)
    })
  },

  quizAnswer(answerNum: number) {
    if (
      this.quiz.questions[this.quiz.currentQuestion].options[answerNum].valid
    ) {
      this.quiz.highlightQuizAnswer.style = "--right"
      this.quiz.score++
    } else {
      this.quiz.highlightQuizAnswer.style = "--wrong"
    }
    this.quiz.highlightQuizAnswer.num = answerNum

    setTimeout(() => {
      this.quiz.highlightQuizAnswer.style = ""
      this.quiz.highlightQuizAnswer.num = -1
      if (this.quiz.currentQuestion < this.quiz.questions.length - 1)
        this.quiz.currentQuestion++
      else {
        this.quiz.finished = true
        setTimeout(() => {
          this.quiz.finishAnimated = true
        }, 300)
      }
    }, 1000)
  },

  quizCurrentQuestion() {
    return this.quiz.questions[this.quiz.currentQuestion]
  },

  quizRestart() {
    this.quiz.currentQuestion = 0
    this.quiz.score = 0
    this.quiz.finished = false
    this.quiz.finishAnimated = false
  },

  goToScan() {
    window.location.href = "/scan.html"
  },

  restartPaint() {
    this.player.isFinished = false
    this.player.currentNode = 1
    this.player.currentNodeGuide = 1
  },

  paintData(): Paint | undefined {
    return this.paints.find((paint) => {
      return paint.id === this.currentPaint
    })
  },

  playPausePaintNode(action?: string) {
    if (action !== undefined) this.isPlaying = action === "play"
    else this.isPlaying = !this.isPlaying
    if (!this.isPlaying) {
      this.videoRef?.pause()
      if (this.videoRefBack !== null) this.videoRefBack?.pause()
    } else {
      this.startNodeVideos()
      setTimeout(() => {
        if (this.isPlaying) this.player.isFooterVisible = false
        if (sessionStorage.getItem("showPlayerHintDisabled") !== "1") {
          setTimeout(() => {
            this.showPlayerHint = true
            sessionStorage.setItem("showPlayerHintDisabled", "1")
            setTimeout(() => {
              this.showPlayerHint = false
            }, 3000)
          }, 1000)
        }
      }, 3000)
    }
    this.playButtonActive = true
    setTimeout(() => {
      this.playButtonActive = false
    }, 800)
  },

  changePaintNodeSpeed() {
    if (this.player.speed === "1") {
      this.player.speed = "1.5"
      if (this.videoRef !== null) {
        this.videoRef.defaultPlaybackRate = 1.5
        this.videoRef.playbackRate = 1.5
        if (this.videoRefBack !== null) {
          this.videoRefBack.defaultPlaybackRate = 1.5
          this.videoRefBack.playbackRate = 1.5
        }
      }
    } else if (this.player.speed === "1.5") {
      this.player.speed = "2"
      if (this.videoRef !== null) {
        this.videoRef.defaultPlaybackRate = 2.0
        this.videoRef.playbackRate = 2.0
        if (this.videoRefBack !== null) {
          this.videoRefBack.defaultPlaybackRate = 2.0
          this.videoRefBack.playbackRate = 2.0
        }
      }
    } else if (this.player.speed === "2") {
      this.player.speed = "1"
      if (this.videoRef !== null) {
        this.videoRef.defaultPlaybackRate = 1.0
        this.videoRef.playbackRate = 1.0
        if (this.videoRefBack !== null) {
          this.videoRefBack.defaultPlaybackRate = 1.0
          this.videoRefBack.playbackRate = 1.0
        }
      }
    }

    this.speedButtonActive = true
    setTimeout(() => {
      this.speedButtonActive = false
    }, 300)
  },

  onLoadedMetadata() {
    if (this.player.playerMode === "video") {
      this.setVideoRef()
      if (this.videoRef) {
        this.videoDuration = this.videoRef.duration
        const slider = document.getElementById("video-duration-slider") as any
        slider.max = this.videoDuration
        // перематываем видео по слайдеру
        slider.addEventListener("change", (event: any) => {
          this.sliderVal = event.detail.value1
        })
        // концовка видео
        this.videoRef.addEventListener("ended", () => {
          this.onEnded()
        })
        // this.videoRef.muted = !this.isSoundOn
      }
    } else {
      this.setAudioRef()
      if (this.audioRef) {
        this.audioDuration = this.audioRef.duration
        // this.audioRef.muted = !this.isSoundOn
      }
    }
  },

  sliderTouchStart() {
    if (this.videoRef !== null) {
      this.playPausePaintNode("pause")
    }
  },
  sliderTouchEnd() {
    if (this.videoRef !== null) {
      this.videoRef.currentTime = this.sliderVal
      this.playPausePaintNode("play")
    }
  },

  onTimeUpdate() {
    dispatchEvent(
      new CustomEvent("time-updated", { detail: { time: this.currentTime } })
    )
    if (this.videoRef !== null && this.videoRef != undefined) {
      const slider = document.getElementById("video-duration-slider") as any
      slider.value = this.videoRef.currentTime

      // const paint = this.paintData()
      let nodeForText = this.paintData().dialogue.find((node: DialogueNode) => {
        return node.id === this.player.currentNodeGuide
      })
      if (nodeForText.text !== "")
        this.player.currentSubtitles = getSubtitles(
          nodeForText.text,
          this.videoRef.currentTime
        )
    }

    // if (this.player.playerMode === "video") {
    //   this.setVideoRef()
    //   if (this.videoRef) {
    //     this.currentTime = this.videoRef.currentTime
    //   }
    // } else {
    //   this.setAudioRef()
    //   if (this.audioRef) {
    //     this.currentTime = this.audioRef.currentTime
    //   }
    // }
  },

  currentNodeData() {
    if (this.paintData() === undefined) return {}
    const node = this.paintData().dialogue.find((node: DialogueNode) => {
      return node.id === this.player.currentNode
    })
    if (node !== undefined) return node
  },

  goToNextNode(id?: number, fromPoint?: boolean) {
    if (fromPoint) this.player.nodeToReturn = this.currentNodeData().id
    else this.player.nodeToReturn = 0

    if (id !== undefined) this.player.currentNode = id
    else this.player.currentNode = this.currentNodeData().nextNodeId
    this.player.currentNodeGuide = this.player.currentNode

    this.player.blockFooter = false
    this.player.pointsReady = false

    if (this.currentNodeData().mediaType === "video") {
      this.setVideoRef()
      if (fromPoint) {
        this.videoRefBack?.closest("span")?.classList.add("--as-point")

        this.videoRefBack?.addEventListener("loadedmetadata", () => {
          this.videoRefBack?.closest("span")?.classList.add("--reveal")
        })
        setTimeout(() => {
          // this.videoRefBack?.classList.remove("--reveal")
          this.isPlaying = true
          this.player.speed = "1"
          this.changePaintNodeSpeed()
          this.startNodeVideos()
        }, 10)
      }
    } else {
      this.player.isFooterVisible = false
      setTimeout(() => {
        this.player.pointsReady = true
      }, 300)

      // this.isImagesLoading = true
      // setTimeout(() => {
      //   loadAllImages(this.currentPaint, this.paintData().dialogue, () => {
      //     this.isImagesLoading = false
      //   })
      // }, 30)

      // window.addEventListener("load", () => {
      //   console.log("Page and all images fully loaded.")
      // })
    }
  },

  closeInPaint() {
    if (this.player.nodeToReturn > 0) {
      this.goToNextNode(this.player.nodeToReturn, false)
      this.player.currentSubtitles = ""
      this.zoomReverse()
      this.videoRefBack?.closest("span")?.classList.remove("--reveal")
    } else if (this.player.currentPoint > 0 && this.isPlaying) {
      this.currentNodeData().pointsOfInterest.find((p: Point) => {
        return p.id === this.player.currentActivePoint
      }).finished = true
      this.zoomReverse()
    } else this.goToScan()
  },

  startNodeVideos() {
    this.videoRef?.play()
    if (
      this.videoRefBack !== null &&
      this.player.currentNodeGuide === this.currentNodeData().id
    )
      this.videoRefBack?.play()
  },

  onEnded() {
    this.player.currentSubtitles = ""
    if (this.player.playerMode === "video") {
      if (this.currentNodeData().autoNext) {
        this.goToNextNode()
      }
      // this.progress.pictures[this.player.currentPicture].isVideoDone = true
      // this.setProgressToLocalStorage()
      // this.handlePlayerSwitchMode("picture")
    } else {
      // this.progress.pictures[this.player.currentPicture].pointsDone[
      //   this.player.currentPoint
      // ] = true
    }
    this.isPlaying = false
    if (this.videoRefBack !== null) this.videoRefBack?.pause()
    // this.setProgressToLocalStorage()
  },

  exit() {
    window.close()
  },

  // .. TMP
  playVideo() {
    if (this.player.playerMode === "video") {
      this.setVideoRef()
      if (this.videoRef) {
        // this.videoRef.muted = !this.isSoundOn
        this.isPlaying = true
        this.startNodeVideos()
      }
    }
  },

  pointVideoSource() {
    return (
      "/paints/" +
      this.currentPaint +
      "/node-" +
      this.player.currentNodeGuide.toString() +
      "-guide.mov"
    )
  },

  handlePointClick(id) {
    this.hideHints()
    this.player.currentActivePoint = id
    this.currentNodeData().pointsOfInterest.forEach((point: Point) => {
      point.hide = false
    })
    const point = this.currentNodeData().pointsOfInterest.find((p: Point) => {
      return p.id === id
    })
    if (point.finished) return

    // .. по первой точке уже пишем, что картину просмотрели
    this.saveGlobalProgress(this.currentPaint)

    if (point.zoom) {
      point.hide = true
      this.zoomToPoint(point)

      let finishedQty = this.currentNodeData().pointsOfInterest.filter(
        (p: Point) => {
          return !p.finished
        }
      ).length

      if (finishedQty === 1) {
        this.player.blockFooter = true
        this.player.isFooterVisible = false
        this.videoRef?.addEventListener("ended", () => {
          point.finished = true
          this.player.currentNodeGuide = 0
        })
      } else {
        point.finished = true
      }
      this.player.currentNodeGuide = point.nodeId
      this.player.speed = "1"
      if (this.videoRef != null) {
        this.videoRef.defaultPlaybackRate = 1
        this.videoRef.playbackRate = 1
      }
      setTimeout(() => {
        if (!this.player.blockFooter) this.player.isFooterVisible = true
        this.playPausePaintNode("play")
        // this.onLoadedMetadata()
      }, 100)
    } else {
      point.hide = true
      this.zoomToPoint(point, () => {
        point.finished = true
        if (point.nodeId !== undefined) this.goToNextNode(point.nodeId, true)
      })

      // point.finished = true

      // if (this.allPointsFinished()) {
      //   this.saveGlobalProgress(this.currentPaint)
      // }

      // if (point.nodeId !== undefined) this.goToNextNode(point.nodeId, true)
    }

    setTimeout(() => {
      if (this.isPlaying) this.player.isFooterVisible = false
    }, 3000)
  },

  allPointsFinished() {
    let finished = true
    if (this.currentNodeData().pointsOfInterest === undefined) return false
    this.currentNodeData().pointsOfInterest.forEach((point: Point) => {
      if (point.finished !== true) finished = false
    })
    return finished
  },

  goToNextPaint() {
    let currentProgress = [] as string[]
    let currentProgressStr = sessionStorage.getItem("vdnhPaintsProgress")
    if (currentProgressStr !== null) {
      currentProgress = currentProgressStr.split(",")
    }
    if (currentProgress.length === 5) this.player.isFinished = true
    else this.goToScan()
  },

  saveGlobalProgress(paintId: number) {
    let currentProgress = [] as string[]
    let currentProgressStr = sessionStorage.getItem("vdnhPaintsProgress")
    if (currentProgressStr === null) currentProgress = []
    else currentProgress = currentProgressStr.split(",")
    if (currentProgress.indexOf(paintId.toString()) === -1)
      currentProgress.push(paintId.toString())
    sessionStorage.setItem("vdnhPaintsProgress", currentProgress.join(","))
  },

  // get showPointsHint() {
  //   let ssHide = sessionStorage.getItem("vdnhHideHints")
  //   return !(ssHide === "1")
  // },

  hideHints() {
    if (this.currentNodeData().mediaType === "img") {
      sessionStorage.setItem("vdnhHideHints", "1")
      this.showPointsHint = false
    }
  },

  startPaintGame() {
    this.player.isPaintStarted = true
    setTimeout(() => {
      this.player.videoReady = true
      this.playPausePaintNode("play")
    }, 300)
  },

  zoomReverse() {
    this.player.currentActivePoint = 0
    this.player.isFooterVisible = false
    this.videoRef?.pause()
    this.isPlaying = false
    this.player.currentSubtitles = ""
    this.player.currentNodeGuide = this.currentNodeData().id
    let scale = 1
    let x = 0
    const element = document.getElementById("img-to-play")
    if (element !== null) {
      element.dataset.scaled = scale.toString()
      element.dataset.xcoord = x.toString()
      element.style.transform = `translate(${x}px, 0px) scale(${scale})`
    }

    const debug = document.getElementById("debug-zoom") as HTMLElement
    debug.innerHTML = "x: " + x + ", y: " + 0

    let points = document.querySelectorAll(".point")
    points.forEach((point) => {
      // @ts-ignore
      point.style.transform = "scale(1)"
    })

    this.currentNodeData().pointsOfInterest.map((p: Point) => {
      p.hide = false
    })
  },

  zoomToPoint(point: Point, callback?: VoidFunction) {
    const element = document.getElementById("img-to-play")
    if (element !== null) {
      let scale = 1
      let x = 0
      let y = 0
      let n = 6
      if (point.zoomN !== undefined && point.zoomN !== 6) {
        n = point.zoomN
      }
      let percent = (50 - point.x) / 100
      let step = 0.05
      if (n < 2) step = 0.1
      if (n > 6) step = 0.1
      let stepsQty = (n - 1) / step

      let yStep = 0
      let xStep = 0
      console.log(point.zoomCoord)
      if (point.zoomCoord !== undefined) {
        yStep = point.zoomCoord.y / stepsQty
        xStep = point.zoomCoord.x / stepsQty
      }

      let scaleTimer = setInterval(() => {
        if (xStep > 0) x += xStep
        else x = Math.round(window.innerWidth * scale * percent)
        y += yStep

        if (scale < n) {
          scale += step
          element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
        }

        if (scale >= n) {
          clearInterval(scaleTimer)
          element.dataset.scaled = scale.toString()
          element.dataset.xcoord = x.toString()
          element.dataset.ycoord = y.toString()
          if (callback !== undefined) callback()
        }

        // const debug = document.getElementById("debug-zoom") as HTMLElement
        // debug.innerHTML = "x: " + x + ", y: " + y
      }, 3)

      this.videoRef?.addEventListener("ended", () => {
        this.zoomReverse()
      })
    }
  },
}

function getQsParam(paramName: string) {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const name = urlParams.get(paramName)
  return name === undefined ? "" : name
}

// Function to check if all videos are loaded
/*
function checkAllVideosLoaded() {
  // 1. Get all video elements on the page
  const videos = document.querySelectorAll("video")
  let videosLoadedCount = 0

  // 2. Define a function to handle a single video's load event
  const videoLoadHandler = () => {
    videosLoadedCount++
    // console.log(`Video loaded: ${videosLoadedCount}/${videos.length}`)

    // 3. Check if all videos have been loaded
    if (videosLoadedCount === videos.length) {
      // console.log("All videos on the page have loaded!")
      // Place your code here to run once all videos are ready
      onAllVideosLoaded()
    }
  }

  // 4. Attach the 'canplaythrough' event listener to each video
  videos.forEach((video) => {
    // If the video is already in a sufficient state (e.g., loaded from cache),
    // the event might not fire, so we check the readyState first.
    if (video.readyState >= 4) {
      // HAVE_ENOUGH_DATA
      videoLoadHandler()
    } else {
      video.addEventListener("canplaythrough", videoLoadHandler, { once: true })
    }
  })

  // Handle the case where there are no videos, or if all were already loaded
  if (videos.length === 0 || videosLoadedCount === videos.length) {
    onAllVideosLoaded()
  }
}


// Function to execute when all videos are loaded
function onAllVideosLoaded() {
  // Your application logic goes here
  console.log("Execution can proceed now that all videos are ready.")
  // appStore.playPausePaintNode()
}
*/

async function loadIntroImages(callback: VoidFunction) {
  console.log("start loading")
  let urls: string[] = []

  let paintImg = document.querySelectorAll(".intro ._preload-intro-img")
  paintImg.forEach((img) => {
    /// @ts-ignore
    urls.push(img.src)
  })

  console.log(urls)

  const promises = urls.map((url) => loadImage(url))
  await Promise.all(promises)
  console.log("stop loading")
  callback()
}

async function loadAllImages(
  paintId: number,
  dialogue: any[],
  callback: VoidFunction
) {
  let urls: string[] = []
  let urlsVideo: string[] = []
  urls.push("paints/" + paintId + "/paint.jpg")
  urlsVideo.push("/paints/" + paintId + "/node-1.mp4")
  dialogue.forEach((dNode) => {
    if (dNode.mediaType === "img")
      urls.push("paints/" + paintId + "/node-" + dNode.id + ".jpg")

    if (dNode.pointsOfInterest !== undefined) {
      dNode.pointsOfInterest.forEach((point: Point) => {
        urls.push(
          "paints/" +
            paintId +
            "/node-" +
            dNode.id +
            "-point-" +
            point.id +
            ".png"
        )
      })
      if (dNode.pointsOfInterest[0].zoom === undefined) {
        dNode.pointsOfInterest.forEach((point: Point) => {
          let _url = `/paints/${paintId}/node-${point.nodeId}.mp4`
          urlsVideo.push(_url)
        })
      }
    }
  })

  console.log(urlsVideo)
  // console.log(urls)
  if (urlsVideo.length > 0) {
    let buffer = document.getElementById("videos-buffer")
    urlsVideo.forEach((_v) => {
      const videoElement = document.createElement("video")
      videoElement.src = _v
      videoElement.controls = false
      videoElement.autoplay = false
      videoElement.muted = true
      buffer?.appendChild(videoElement)
    })
    //   console.log(urlsVideo)
    //   checkAllVideosLoaded()
  }

  // let paintImg = document.querySelectorAll("._preload-img")
  // paintImg.forEach((img) => {
  //   /// @ts-ignore
  //   urls.push(img.src)
  // })
  const promises = urls.map((url) => loadImage(url))
  await Promise.all(promises)
  // if (urlsVideo.length > 0) {
  //   await waitForAllVideos()
  // }
  console.log("all media content is ready")
  callback()
}

function loadImage(url: string) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = url
  })
}

/*
async function waitForAllVideos() {
  // Select all video elements
  const videos = document.querySelectorAll("#videos-buffer video")

  // Create an array of Promises for each video
  // @ts-ignore
  const videoPromises = Array.from(videos).map(videoCanPlayThrough)

  console.log(`Waiting for ${videoPromises.length} video(s) to load...`)

  try {
    // Wait for all promises to resolve
    await Promise.all(videoPromises)
    console.log("All videos are ready for playback!")
    // Place the code you want to run after all videos have loaded here
    console.log("videos are ready")
  } catch (error) {
    console.error("An error occurred while loading videos:", error)
  }
}

function videoCanPlayThrough(video: HTMLVideoElement) {
  // Check if the video is already in a state where it can play through
  if (video.readyState >= 4) {
    // HAVE_ENOUGH_DATA
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    video.addEventListener(
      "canplaythrough",
      () => {
        // @ts-ignore
        resolve()
      },
      { once: true }
    ) // Use { once: true } to automatically remove the listener
  })
}
*/
