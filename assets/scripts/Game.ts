import {
  _decorator,
  AudioClip,
  AudioSource,
  Component,
  EventTouch,
  instantiate,
  LabelComponent,
  Node,
  NodeEventType,
  Prefab,
  sys,
  tween,
  UITransform,
  v2,
  v3,
} from "cc";
import { Tile } from "./Tile";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  @property(Node)
  startPanel: Node = null;

  @property(Node)
  gamePanel: Node = null;

  @property(Node)
  overPanel: Node = null;

  @property(LabelComponent)
  txtLv: LabelComponent = null!;

  @property(LabelComponent)
  txtScore: LabelComponent = null!;

  @property(LabelComponent)
  txtBestScore: LabelComponent = null!;

  @property(LabelComponent)
  txtBack: LabelComponent = null!;

  @property(Node)
  ndParent: Node = null;

  @property(UITransform)
  ndParentTransform: UITransform = null!;

  @property(Prefab)
  item: Prefab = null!;

  @property(Prefab)
  itemBg: Prefab = null!;

  @property(LabelComponent)
  txtOverScore: LabelComponent = null!;

  @property(AudioClip)
  soundMove: AudioClip = null!;
  @property(AudioClip)
  soundGetScore: AudioClip = null!;

  private userData: any = null;
  // 间隔
  private gap: number = 0;
  // 格子宽高
  private itemWH: number = 0;
  // 父容器宽高
  private itemParentWH: number = 0;
  // 初始化数组
  private array = [];

  private posStart;
  private posEnd;

  private gameType: number = 0;

  start() {
    this.initPanel();
    this.startPanel.active = true;
    this.addTouch();
  }

  private addTouch() {
    this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this);
  }

  private onTouchStart(event: EventTouch) {
    if (this.gameType !== 1) {
      return;
    }
    this.posStart = event.getLocation();
  }

  private onTouchMove(event: EventTouch) {
    if (this.gameType !== 1) {
      return;
    }
  }

  private onTouchEnd(event: EventTouch) {
    if (this.gameType !== 1) {
      return;
    }
    this.posEnd = event.getLocation();
    let xx = this.posEnd.x - this.posStart.x;
    let yy = this.posEnd.y - this.posStart.y;

    if (Math.abs(xx) < 10 && Math.abs(yy) < 10) {
      return;
    }

    if (Math.abs(xx) > Math.abs(yy)) {
      if (xx > 0) {
        this.moveItem("right");
        console.log("move to right");
      } else {
        this.moveItem("left");
        console.log("move to left");
      }
    } else {
      if (yy < 0) {
        this.moveItem("down");
        console.log("move to down");
      } else {
        this.moveItem("up");
        console.log("move to up");
      }
    }
  }

  private onTouchCancel(event: EventTouch) {
    if (this.gameType !== 1) {
      return;
    }
  }

  private moveItem(type: string) {
    // 是否能移动
    let canMove: boolean = false;
    // 是否能得分
    let isGetScore: boolean = false;

    switch (type) {
      case "right":
        for (let j = 0; j < this.array.length; j++) {
          for (let i = 0; i < this.array.length; i++) {
            for (let k = 0; k < this.array.length; k++) {
              // 能移动
              if (
                j + 1 + k < this.array.length &&
                this.array[i][j + 1 + k] === 0 &&
                this.array[i][j + k] > 0
              ) {
                this.array[i][j + 1 + k] = this.array[i][j + k];
                this.array[i][j + k] = 0;
                canMove = true;
                break;
              } else if (
                j + 1 + k < this.array.length &&
                this.array[i][j + 1 + k] === this.array[i][j + k] &&
                this.array[i][j + k] > 0
              ) {
                // 两个值相等且大于 0
                this.array[i][j + 1 + k] = this.array[i][j + 1 + k] * 2;
                // 将移动的格子清零
                this.array[i][j + k] = 0;
                canMove = true;
                isGetScore = true;
                this.updateScore(this.array[i][j + 1 + k]);
                break;
              }
            }
          }
        }
        break;
      case "left":
        for (let j = 1; j < this.array.length; j++) {
          for (let i = 0; i < this.array[j].length; i++) {
            for (let k = 0; k < this.array.length; k++) {
              // 从上往下减
              if (
                j - 1 - k >= 0 &&
                this.array[i][j - 1 - k] === 0 &&
                this.array[i][j - k] > 0
              ) {
                this.array[i][j - 1 - k] = this.array[i][j - k];
                this.array[i][j - k] = 0;
                canMove = true;
                break;
              } else if (
                j - 1 - k >= 0 &&
                this.array[i][j - 1 - k] === this.array[i][j - k] &&
                this.array[i][j - k] > 0
              ) {
                this.array[i][j - 1 - k] = this.array[i][j - 1 - k] * 2;
                this.array[i][j - k] = 0;
                canMove = true;
                isGetScore = true;
                this.updateScore(this.array[i][j - 1 - k]);
                break;
              }
            }
          }
        }
        break;
      case "up":
        for (let i = this.array.length - 2; i >= 0; i--) {
          for (let j = 0; j < this.array[i].length; j++) {
            for (let k = 0; k < this.array.length; k++) {
              if (
                i + 1 + k < this.array.length &&
                this.array[i + 1 + k][j] === 0 &&
                this.array[i + k][j] > 0
              ) {
                this.array[i + 1 + k][j] = this.array[i + k][j];
                this.array[i + k][j] = 0;
                canMove = true;
                break;
              } else if (
                i + 1 + k < this.array.length &&
                this.array[i + 1 + k][j] === this.array[i + k][j] &&
                this.array[i + k][j] > 0
              ) {
                this.array[i + 1 + k][j] = this.array[i + 1 + k][j] * 2;
                this.array[i + k][j] = 0;
                canMove = true;
                isGetScore = true;
                this.updateScore(this.array[i + 1 + k][j]);
                break;
              }
            }
          }
        }
        break;
      case "down":
        for (let i = 1; i < this.array.length; i++) {
          for (let j = 0; j < this.array[i].length; j++) {
            for (let k = 0; k < this.array.length; k++) {
              if (
                i - 1 - k >= 0 &&
                this.array[i - 1 - k][j] === 0 &&
                this.array[i - k][j] > 0
              ) {
                this.array[i - 1 - k][j] = this.array[i - k][j];
                this.array[i - k][j] = 0;
                canMove = true;
                break;
              }

              if (
                i - 1 - k >= 0 &&
                this.array[i - 1 - k][j] === this.array[i - k][j] &&
                this.array[i - k][j] > 0
              ) {
                this.array[i - 1 - k][j] = this.array[i - 1 - k][j] * 2;
                this.array[i - k][j] = 0;
                canMove = true;
                isGetScore = true;
                this.updateScore(this.array[i - 1 - k][j]);
                break;
              }
            }
          }
        }
        break;

      default:
        break;
    }

    if (canMove) {
      let ad: AudioSource = new AudioSource();

      if (isGetScore) {
        ad.playOneShot(this.soundGetScore);
      } else {
        ad.playOneShot(this.soundMove);
      }

      this.cleanAllItem();

      for (let i = 0; i < this.array.length; i++) {
        for (let j = 0; j < this.array[i].length; j++) {
          // 有格子
          if (this.array[i][j] > 0) {
            let pos = v2(i, j);
            this.createItem(pos, this.array[i][j]);
          }
        }
      }

      this.addRandomArray();
    }
  }

  // 清空格子
  private cleanAllItem() {
    // 拿到父容器的所有对象
    let children = this.ndParent.children;
    for (let i = children.length - 1; i >= 0; i--) {
      let tile = children[i].getComponent(Tile);
      if (tile) {
        this.ndParent.removeChild(children[i]);
      }
    }
  }

  private cleanAllItemBg() {
    let children = this.ndParent.children;
    for (let i = children.length - 1; i >= 0; i--) {
      let tile = children[i].getComponent(Tile);
      if (!tile) {
        this.ndParent.removeChild(children[i]);
      }
    }
  }

  // 更新分数
  private updateScore(score: number) {
    this.userData.score += score;
    if (this.userData.score > this.userData.bestScore) {
      this.userData.bestScore = this.userData.score;
    }

    this.txtScore.string = this.userData.score.toString();
    this.txtBestScore.string = this.userData.bestScore.toString();

    this.saveUserInfo();
  }

  update(deltaTime: number) {}

  private initPanel() {
    this.startPanel.active = false;
    this.gamePanel.active = false;
    this.overPanel.active = false;
  }

  // 初始化
  private init() {
    this.getUserInfo();
    // 刷新界面
    this.updateView();
  }

  // 获取用户信息
  private getUserInfo() {
    this.userData = JSON.parse(sys.localStorage.getItem("userData"));

    if (this.userData == null) {
      this.userData = {
        level: 5,
        score: 0,
        bestScore: 0,
        // 当前记录
        array: [],
        // 历史记录
        arr_history: [],
        // 返回次数
        backNum: 3,
      };
    }
  }

  private saveUserInfo() {
    sys.localStorage.setItem("userData", JSON.stringify(this.userData));
  }

  private updateView() {
    this.gameType = 1;
    let level = this.userData.level;

    this.gap = 5;
    // 格子大小
    this.itemWH = Math.round(640 / level);
    // 父容器大小
    this.itemParentWH = this.itemWH * level + this.gap * (level + 1);
    this.ndParentTransform.width = this.itemParentWH;
    this.ndParentTransform.height = this.itemParentWH;
    // 添加格子背景
    this.addItemBg(level);

    this.txtLv.string = `${level}x${level}`;
    this.txtScore.string = `${this.userData.score}`;
    this.txtBestScore.string = `${this.userData.bestScore}`;

    let len = this.userData.arr_history.length - 1;
    if (len <= 0) {
      len = 0;
    }
    if (len > this.userData.backNum) {
      len = this.userData.backNum;
    }

    this.txtBack.string = `撤回(${len})`;

    // 无保存记录
    if (this.userData.array.length === 0) {
      // 初始化数组
      this.initArray(level);
      // 创建随机数组
      this.addRandomArray();
    } else {
      this.array = this.userData.array;
      for (let i = 0; i < this.array.length; i++) {
        for (let j = 0; j < this.array[i].length; j++) {
          if (this.array[i][j] > 0) {
            let pos = v2(i, j);
            this.createItem(pos, this.array[i][j]);
          }
        }
      }
    }
  }

  // 初始化数组
  private initArray(lv: number) {
    this.array = [];
    for (let i = 0; i < lv; i++) {
      this.array[i] = [];
    }

    for (let i = 0; i < lv; i++) {
      for (let j = 0; j < lv; j++) {
        this.array[i][j] = 0;
      }
    }
  }

  // 空格子上随机添加数字
  private addRandomArray() {
    let arr_0 = [];
    for (let i = 0; i < this.array.length; i++) {
      for (let j = 0; j < this.array[i].length; j++) {
        const element = this.array[i][j];

        if (element === 0) {
          arr_0.push(v2(i, j));
        }
      }
    }

    if (arr_0.length !== 0) {
      let i_random = Math.floor(Math.random() * arr_0.length);
      let ii = arr_0[i_random].x;
      let jj = arr_0[i_random].y;
      let randomNum = Math.random() * 10;
      if (randomNum < 2) {
        this.array[ii][jj] = 4;
      } else {
        this.array[ii][jj] = 2;
      }

      this.createItem(arr_0[i_random], this.array[ii][jj], true);
      this.onCheckOver();
    }
  }

  private createItem(pos, num: number, isAction = false) {
    let posStart = v2(
      -this.itemParentWH / 2 + this.itemWH / 2 + this.gap,
      -this.itemParentWH / 2 + this.itemWH / 2 + this.gap
    );
    let item = instantiate(this.item);
    let tile = item.getComponent(Tile);

    if (tile) {
      tile.init(num);
    }

    item.parent = this.ndParent;

    let itemTf: UITransform = item.getComponent(UITransform);
    itemTf.width = this.itemWH;
    itemTf.height = this.itemWH;

    let _x = posStart.x + (itemTf.width + this.gap) * pos.y;
    let _y = posStart.y + (itemTf.height + this.gap) * pos.x;

    item.position = v3(_x, _y, 0);

    if (isAction) {
      item.scale = v3(0, 0, 0);
      tween(item)
        .to(0.15, { scale: v3(1, 1, 1) }, { easing: "sineInOut" })
        .start();
    }
  }

  addItemBg(lv: number) {
    let posStart = v2(
      -this.itemParentWH / 2 + this.itemWH / 2 + this.gap,
      -this.itemParentWH / 2 + this.itemWH / 2 + this.gap
    );

    for (let i = 0; i < lv; i++) {
      for (let j = 0; j < lv; j++) {
        let itemBg = instantiate(this.itemBg);
        itemBg.parent = this.ndParent;
        let itemBgTf: UITransform = itemBg.getComponent(UITransform);
        itemBgTf.width = this.itemWH;
        itemBgTf.height = this.itemWH;
        let posX = posStart.x + (itemBgTf.width + this.gap) * j;
        let posY = posStart.y + (itemBgTf.height + this.gap) * i;

        itemBg.position = v3(posX, posY, 0);
      }
    }
  }

  // 点击开始按钮
  private onBtnStartClick() {
    this.initPanel();
    this.gamePanel.active = true;
    this.init();
  }

  private onBtnReplayClick() {
    this.gameType = 1;
    this.userData.score = 0;
    this.userData.arr_history = [];
    this.txtBack.string = `撤回(0)`;
    this.userData.backNum = 3;
    this.txtScore.string = "0";
    this.cleanAllItem();
    this.initArray(this.userData.lv);
    this.addRandomArray();
  }

  private onBtnBackClick() {
    let len = this.userData.arr_history.length;

    if (len >= 2 && this.userData.backNum > 0) {
      this.userData.arr_history.pop();
      let str_arr = this.userData.arr_history[len - 2];

      let arr = str_arr.split(",");
      this.cleanAllItem();

      let k_num = -1;
      for (let i = 0; i < this.array.length; i++) {
        for (let j = 0; j < this.array[i].length; j++) {
          k_num++;
          this.array[i][j] = parseInt(arr[k_num]);
          if (this.array[i][j] > 0) {
            let pos = v2(i, j);
            this.createItem(pos, this.array[i][j], true);
          }
        }
      }

      this.userData.backNum--;

      let len1 = this.userData.arr_history.length - 1;
      if (len1 <= 0) {
        len1 = 0;
      }

      if (len1 > this.userData.backNum) {
        len1 = this.userData.backNum;
      }

      this.txtBack.string = `撤回(${len1})`;
      this.saveUserInfo();
    }
  }

  private onBtnHomeClick() {
    this.initPanel();
    this.startPanel.active = true;
    this.gameType = 0;
    this.cleanAllItem();
    this.cleanAllItemBg();
  }

  private onOverBtnReplayClick() {
    this.overPanel.active = false;
    this.gameType = 1;
    this.userData.score = 0;
    this.userData.arr_history = [];
    this.txtBack.string = `撤回(0)`;
    this.userData.backNum = 3;
    this.txtScore.string = "0";
    this.cleanAllItem();
    this.initArray(this.userData.lv);
    this.addRandomArray();
  }

  private onOverBtnHomeClick() {
    this.initPanel();
    this.startPanel.active = true;
    this.gameType = 0;
    this.cleanAllItem();
    this.cleanAllItemBg();
  }

  // 检测是否游戏结束
  private onCheckOver() {
    let isOver = true;

    for (let i = 0; i < this.array.length; i++) {
      for (let j = 0; j < this.array[i].length; j++) {
        if (this.array[i][j] === 0) {
          isOver = false;
        }
      }
    }

    // 删除降低结束难度
    // for (let i = 0; i < this.array.length; i++) {
    //   for (let j = 0; j < this.array[i].length; j++) {
    //     if (
    //       j + 1 < this.array.length &&
    //       this.array[i][j] === this.array[i][j + 1]
    //     ) {
    //       isOver = false;
    //     } else if (
    //       i + 1 < this.array.length &&
    //       this.array[i][j] === this.array[i + 1][j]
    //     ) {
    //       isOver = false;
    //     }
    //   }
    // }

    if (isOver) {
      this.gameType = 2;
      this.overPanel.active = true;

      let gameOverScore = this.userData.score;
      this.txtOverScore.string = `获得${gameOverScore}分`;
      this.userData.score = 0;
      this.userData.array = [];
      this.userData.arr_history = [];
      this.userData.backNum = 3;

      this.saveUserInfo();
    } else {
      this.userData.arr_history.push(this.array.join());
      this.userData.array = this.array;
      let len = this.userData.arr_history.length - 1;
      if (len > 10) {
        this.userData.arr_history.shift();
      }

      if (len > this.userData.backNum) {
        len = this.userData.backNum;
      }

      this.txtBack.string = `撤回(${len})`;

      this.saveUserInfo();
    }
  }
}
