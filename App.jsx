import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

// オブジェクトの種類
const OBJECT_TYPE = {
  FAVORITE: 'favorite',    // 好物（黄色い円）
  DANGER_WATER: 'danger_water',  // 危険：水たまり（青い長方形）
  DANGER_CAR: 'danger_car',      // 危険：車（赤い長方形）
  TEMPTATION: 'temptation' // 誘惑（緑色の円）
}

function App() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isStunned, setIsStunned] = useState(false)
  const [stunMessage, setStunMessage] = useState('')
  const [speedLevel, setSpeedLevel] = useState(1.0)
  
  // キャンバス設定（定数を先に定義）
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 400
  const GROUND_Y = CANVAS_HEIGHT - 80  // 地面のY座標
  const PLAYER_START_X = 100  // プレイヤーの初期X座標
  const PLAYER_SIZE = 30  // プレイヤーのサイズ
  const GRAVITY = 0.8
  const JUMP_POWER = -15
  const SCROLL_SPEED = 3
  const PLAYER_MOVE_SPEED = 5  // プレイヤーの移動速度（px/frame）
  
  // ゲーム状態
  const gameStateRef = useRef({
    playerX: PLAYER_START_X,  // プレイヤーのX座標（画面内の位置）
    playerY: 0,           // プレイヤーのY座標（地面からの高さ）
    playerVelocityY: 0,   // プレイヤーのY方向の速度
    isJumping: false,     // ジャンプ中かどうか
    isOnGround: true,     // 地面にいるかどうか
    objects: [],          // 流れてくるオブジェクト
    scrollOffset: 0,      // スクロールオフセット（世界座標）
    lastSpawnTime: 0,     // 最後にオブジェクトを生成した時刻
    stunTimer: 0,         // スタンタイマー
    animationId: null,
    gameOver: false,      // ゲームオーバー状態（refで管理）
    gameTime: 0,          // ゲーム経過時間（フレーム数）
    speedMultiplier: 1.0,  // 速度倍率（難易度調整用）
    keys: {               // 押下中のキー
      left: false,
      right: false
    }
  })

  // 描画関数：プレイヤー（ひかり）
  const drawPlayer = (ctx) => {
    const { playerX, playerY } = gameStateRef.current
    const y = GROUND_Y - PLAYER_SIZE - playerY
    
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(playerX, y, PLAYER_SIZE, PLAYER_SIZE)
  }

  // 描画関数：好物（黄色い円）
  const drawFavorite = (ctx, x, y, size) => {
    ctx.fillStyle = '#FFFF00'
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // 描画関数：危険 - 水たまり（青い長方形）
  const drawDangerWater = (ctx, x, y, width, height) => {
    ctx.fillStyle = '#0000FF'
    ctx.fillRect(x, y, width, height)
  }

  // 描画関数：危険 - 車（赤い長方形）
  const drawDangerCar = (ctx, x, y, width, height) => {
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(x, y, width, height)
  }

  // 描画関数：誘惑（緑色の円）
  const drawTemptation = (ctx, x, y, size) => {
    ctx.fillStyle = '#00FF00'
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // 描画関数：オブジェクト
  const drawObject = (ctx, obj) => {
    const { type, x, y, width, height, size } = obj
    
    switch (type) {
      case OBJECT_TYPE.FAVORITE:
        drawFavorite(ctx, x, y, size)
        break
      case OBJECT_TYPE.DANGER_WATER:
        drawDangerWater(ctx, x, y, width, height)
        break
      case OBJECT_TYPE.DANGER_CAR:
        drawDangerCar(ctx, x, y, width, height)
        break
      case OBJECT_TYPE.TEMPTATION:
        drawTemptation(ctx, x, y, size)
        break
      default:
        break
    }
  }

  // 描画関数：地面
  const drawGround = (ctx) => {
    const { scrollOffset } = gameStateRef.current
    
    // 地面の背景色
    ctx.fillStyle = '#555555'
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y)
    
    // スクロールを考慮した地面のパターン（タイル状）
    ctx.fillStyle = '#666666'
    const tileWidth = 50
    const offsetX = scrollOffset % tileWidth
    for (let x = -offsetX; x < CANVAS_WIDTH; x += tileWidth) {
      ctx.fillRect(x, GROUND_Y, tileWidth / 2, CANVAS_HEIGHT - GROUND_Y)
    }
    
    // 地面の線
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y)
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y)
    ctx.stroke()
  }

  // 衝突判定
  const checkCollision = (obj1, obj2) => {
    const getBounds = (obj) => {
      if (obj.type === OBJECT_TYPE.FAVORITE || obj.type === OBJECT_TYPE.TEMPTATION) {
        // 円形オブジェクト
        return {
          x: obj.x - obj.size / 2,
          y: obj.y - obj.size / 2,
          width: obj.size,
          height: obj.size
        }
      } else {
        // 長方形オブジェクト
        return {
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height
        }
      }
    }

    const bounds1 = getBounds(obj1)
    const bounds2 = getBounds(obj2)

    return bounds1.x < bounds2.x + bounds2.width &&
           bounds1.x + bounds1.width > bounds2.x &&
           bounds1.y < bounds2.y + bounds2.height &&
           bounds1.y + bounds1.height > bounds2.y
  }

  // オブジェクト生成
  const spawnObject = () => {
    const types = [
      OBJECT_TYPE.FAVORITE,
      OBJECT_TYPE.DANGER_WATER,
      OBJECT_TYPE.DANGER_CAR,
      OBJECT_TYPE.TEMPTATION
    ]
    
    const weights = [0.4, 0.2, 0.2, 0.2]  // 出現確率
    
    let rand = Math.random()
    let type = OBJECT_TYPE.FAVORITE
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i]
      if (rand <= sum) {
        type = types[i]
        break
      }
    }

    // 速度のバリエーション（基本速度の0.7倍～1.5倍）
    const speedMultiplier = 0.7 + Math.random() * 0.8
    const baseSpeed = SCROLL_SPEED * speedMultiplier

    // オブジェクトを世界座標（scrollOffset基準）で生成
    // プレイヤーの前方（右側）に生成
    const state = gameStateRef.current
    const worldX = state.scrollOffset + CANVAS_WIDTH + 50 + Math.random() * 200

    let obj = {
      type,
      worldX: worldX,  // 世界座標でのX位置
      id: Date.now() + Math.random(),
      speed: baseSpeed,  // 個別の速度
      verticalSpeed: 0,  // 上下移動の速度
      verticalAmplitude: 0,  // 上下移動の振幅
      initialY: 0  // 初期Y座標
    }

    if (type === OBJECT_TYPE.FAVORITE || type === OBJECT_TYPE.TEMPTATION) {
      // 円形オブジェクト
      obj.size = 25
      obj.initialY = GROUND_Y - obj.size / 2
      // 一部のオブジェクトは上下に動く
      if (Math.random() > 0.6) {
        obj.verticalAmplitude = 20 + Math.random() * 30
        obj.verticalSpeed = 0.05 + Math.random() * 0.1
      }
      obj.y = obj.initialY
      obj.width = obj.size
      obj.height = obj.size
    } else {
      // 長方形オブジェクト
      obj.width = 40
      obj.height = 30
      obj.initialY = GROUND_Y - obj.height
      // 危険物は時々高さが異なる位置に出現
      if (Math.random() > 0.7) {
        obj.initialY = GROUND_Y - obj.height - (20 + Math.random() * 40)
      }
      obj.y = obj.initialY
      obj.size = Math.max(obj.width, obj.height)
    }

    gameStateRef.current.objects.push(obj)
  }

  // ジャンプ処理
  const handleJump = useCallback(() => {
    const state = gameStateRef.current
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:192',message:'handleJump called',data:{isOnGround:state.isOnGround,isStunned,gameOver},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // 地面にいる時（playerYが0または非常に小さい値）のみジャンプ可能
    if (state.playerY <= 1 && !isStunned && !gameOver) {
      state.isJumping = true
      state.isOnGround = false
      state.playerVelocityY = JUMP_POWER
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:197',message:'Jump executed',data:{playerVelocityY:state.playerVelocityY,isJumping:state.isJumping},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:199',message:'Jump blocked',data:{reason:!state.isOnGround?'notOnGround':isStunned?'stunned':'gameOver'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
  }, [isStunned, gameOver])

  // ゲームループ
  useEffect(() => {
    const canvas = canvasRef.current
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:202',message:'useEffect gameLoop entry',data:{canvasExists:!!canvas,canvasWidth:canvas?.width,canvasHeight:canvas?.height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!canvas) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:205',message:'Canvas is null, returning early',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return
    }

    const ctx = canvas.getContext('2d')
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:207',message:'Canvas context obtained',data:{ctxExists:!!ctx},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    let lastTimestamp = performance.now()

    const gameLoop = (timestamp) => {
      try {
        const state = gameStateRef.current
        
        // 初回実行時の初期化
        if (state.lastSpawnTime === 0) {
          state.lastSpawnTime = timestamp
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:235',message:'Game loop first run, initializing spawnTime',data:{timestamp},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
        
        // #region agent log
        if (Math.floor(timestamp / 1000) % 2 === 0 && Math.floor(timestamp / 16) % 60 === 0) {
          fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:243',message:'Game loop running',data:{timestamp,objectsCount:state.objects.length,playerY:state.playerY,isOnGround:state.isOnGround,lastSpawnTime:state.lastSpawnTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion

        // ゲーム時間と速度倍率の更新
        if (!currentGameOver) {
          state.gameTime++
          // 60フレーム（約1秒）ごとに速度倍率を0.01増加（最大2.5倍まで）
          state.speedMultiplier = Math.min(1.0 + (state.gameTime / 60) * 0.01, 2.5)
          // UI更新用に速度レベルを設定（60フレームごとに更新）
          if (state.gameTime % 60 === 0) {
            setSpeedLevel(Math.floor(state.speedMultiplier * 100) / 100)
          }
        }

        // 背景をクリア
        ctx.fillStyle = '#2A2A2A'  // ダークグレー
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        // 地面を描画
        drawGround(ctx)

        // 現在のゲーム状態を取得（refから直接読み取る）
        const currentIsStunned = state.stunTimer > 0
        const currentGameOver = state.gameOver

        // プレイヤーの左右移動
        if (!currentIsStunned && !currentGameOver) {
          if (state.keys.left && state.playerX > 0) {
            state.playerX -= PLAYER_MOVE_SPEED
            // プレイヤーが左に移動すると、スクロールオフセットが増加（世界が右にスクロール）
            state.scrollOffset += PLAYER_MOVE_SPEED
          }
          if (state.keys.right && state.playerX < CANVAS_WIDTH - PLAYER_SIZE) {
            state.playerX += PLAYER_MOVE_SPEED
            // プレイヤーが右に移動すると、スクロールオフセットが減少（世界が左にスクロール）
            state.scrollOffset -= PLAYER_MOVE_SPEED
          }
        }

        // プレイヤーの物理演算
        if (!currentIsStunned && !currentGameOver) {
          // 重力を適用
          // playerYが増加すると上に移動する設計なので、重力で下に落ちるためにはplayerYを減らす必要がある
          // つまり、playerVelocityYを減らす（負の方向に増やす）
          state.playerVelocityY -= GRAVITY
          state.playerY += state.playerVelocityY

          // 地面との衝突判定（playerYが0以下になったら地面に着地）
          if (state.playerY <= 0) {
            state.playerY = 0
            state.playerVelocityY = 0
            state.isOnGround = true
            state.isJumping = false
          }
        }

        // オブジェクトの更新
        state.objects = state.objects.filter(obj => {
          // 世界座標を更新（オブジェクトは自動的に後ろに流れる - 散歩の感覚）
          // オブジェクトは世界座標で固定されているが、自動スクロールで後ろに流れる
          if (obj.worldX !== undefined) {
            // オブジェクトを自動的に後ろに移動（散歩の速度感）
            obj.worldX -= (obj.speed || SCROLL_SPEED) * state.speedMultiplier
            // 画面座標に変換（世界座標 - スクロールオフセット）
            const screenX = obj.worldX - state.scrollOffset
            obj.x = screenX
          } else {
            // 後方互換性：既存のオブジェクトは従来通り（worldXがない場合）
            obj.x -= (obj.speed || SCROLL_SPEED) * state.speedMultiplier
          }

          // 上下移動のアニメーション
          if (obj.verticalAmplitude > 0) {
            obj.verticalSpeed = obj.verticalSpeed || 0.05
            // オブジェクトごとに異なる時間オフセットを使用
            const timeOffset = (obj.id % 1000) * 0.001
            const time = (Date.now() * 0.001) + timeOffset
            obj.y = obj.initialY + Math.sin(time * obj.verticalSpeed * 10) * obj.verticalAmplitude
          }

          // 画面外に出たオブジェクトを削除（後ろに流れたオブジェクト）
          const objWidth = obj.width || obj.size || 0
          if (obj.x + objWidth < -100) {
            return false
          }

          // プレイヤーとの衝突判定
          const playerObj = {
            type: 'player',
            x: state.playerX,
            y: GROUND_Y - PLAYER_SIZE - state.playerY,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            size: PLAYER_SIZE
          }

          if (checkCollision(playerObj, obj)) {
            if (obj.type === OBJECT_TYPE.FAVORITE) {
              // 好物を取った
              setScore(prev => prev + 100)
              return false
            } else if (obj.type === OBJECT_TYPE.DANGER_WATER || obj.type === OBJECT_TYPE.DANGER_CAR) {
              // 危険物に当たった
              if (!currentIsStunned) {
                state.gameOver = true
                setGameOver(true)
              }
              return false
            } else if (obj.type === OBJECT_TYPE.TEMPTATION) {
              // 誘惑に当たった（スタン状態）
              if (!currentIsStunned) {
                setIsStunned(true)
                setStunMessage('遊んでる中...')
                state.stunTimer = 180  // 3秒（60FPS想定）
              }
              return false
            }
          }

          return true
        })

        // スタンタイマーの更新
        if (state.stunTimer > 0) {
          state.stunTimer--
          if (state.stunTimer <= 0) {
            setIsStunned(false)
            setStunMessage('')
          }
        }

        // オブジェクト生成（速度倍率を考慮して生成頻度を調整）
        const spawnInterval = Math.max(1500 / state.speedMultiplier, 800)
        if (timestamp - state.lastSpawnTime > spawnInterval && !currentGameOver) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:412',message:'Spawning object',data:{timestamp,lastSpawnTime:state.lastSpawnTime,timeDiff:timestamp-state.lastSpawnTime,objectsCountBefore:state.objects.length,speedMultiplier:state.speedMultiplier},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          spawnObject()
          state.lastSpawnTime = timestamp
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:417',message:'Object spawned',data:{objectsCountAfter:state.objects.length,lastObject:state.objects[state.objects.length-1]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }

        // オブジェクトを描画
        state.objects.forEach(obj => {
          drawObject(ctx, obj)
        })

        // プレイヤーを描画
        drawPlayer(ctx)
        // #region agent log
        if (Math.floor(timestamp / 16) % 60 === 0) {
          fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:437',message:'Drawing player',data:{playerY:state.playerY,playerX:state.playerX,playerSize:PLAYER_SIZE},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        }
        // #endregion

        // スタンメッセージを描画
        if (state.stunTimer > 0) {
          ctx.fillStyle = '#FFFFFF'
          ctx.font = '24px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('遊んでる中...', CANVAS_WIDTH / 2, 50)
        }

        state.animationId = requestAnimationFrame(gameLoop)
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:360',message:'Game loop error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error('Game loop error:', error)
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:370',message:'Starting game loop',data:{hasCanvas:!!canvas,hasCtx:!!ctx,canvasWidth:canvas?.width,canvasHeight:canvas?.height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const state = gameStateRef.current
    state.animationId = requestAnimationFrame(gameLoop)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:385',message:'Game loop started',data:{animationId:state.animationId,hasRequestAnimationFrame:typeof requestAnimationFrame !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    return () => {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId)
        state.animationId = null
      }
    }
  }, [])  // 依存配列を空にして、一度だけ実行

  // キーボードイベント
  useEffect(() => {
    const handleKeyDown = (e) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:403',message:'Key pressed',data:{code:e.code,key:e.key},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const state = gameStateRef.current
      
      if (e.code === 'Space') {
        e.preventDefault()
        handleJump()
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault()
        state.keys.left = true
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault()
        state.keys.right = true
      }
    }

    const handleKeyUp = (e) => {
      const state = gameStateRef.current
      
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault()
        state.keys.left = false
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault()
        state.keys.right = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:425',message:'Keyboard event listener added',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleJump])

  // タッチイベント
  const handleTouch = (e) => {
    e.preventDefault()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a674a6bb-519d-4052-b9fc-8283b0cd1f7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:343',message:'Touch/click event',data:{type:e.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    handleJump()
  }

  // リトライ
  const handleRetry = () => {
    setScore(0)
    setGameOver(false)
    setIsStunned(false)
    setStunMessage('')
    setSpeedLevel(1.0)
    gameStateRef.current = {
      playerX: PLAYER_START_X,
      playerY: 0,
      playerVelocityY: 0,
      isJumping: false,
      isOnGround: true,
      objects: [],
      scrollOffset: 0,
      lastSpawnTime: 0,
      stunTimer: 0,
      animationId: null,
      gameOver: false,
      gameTime: 0,
      speedMultiplier: 1.0,
      keys: {
        left: false,
        right: false
      }
    }
  }

  return (
    <div className="app">
      <div className="ui">
        <div className="score">スコア: {score}</div>
        <div className="speed-level">速度: {speedLevel}x</div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onTouchStart={handleTouch}
        onClick={handleTouch}
      />

      {gameOver && (
        <div className="game-over">
          <h2>ゲームオーバー</h2>
          <p>スコア: {score}</p>
          <button onClick={handleRetry}>リトライ</button>
        </div>
      )}
    </div>
  )
}

export default App

