import {
  _decorator,
  Component,
  instantiate,
  LabelComponent,
  Node,
  Prefab,
  sys,
  UITransform,
  v2,
  v3,
} from "cc";
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

  private userData: any = null;
  // 间隔
  private gap: number = 0;
  // 格子宽高
  private itemWH: number = 0;
  // 父容器宽高
  private itemParentWH: number = 0;

  start() {
    this.initPanel();
    this.startPanel.active = true;
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
    this.txtBack.string = `撤回(${this.userData.backNum})`;
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

  private onBtnReplayClick() {}

  private onBtnBackClick() {}

  private onBtnHomeClick() {
    this.initPanel();
    this.startPanel.active = true;
  }

  private onOverBtnReplayClick() {
    this.overPanel.active = false;
  }

  private onOverBtnHomeClick() {
    this.initPanel();
    this.startPanel.active = true;
  }
}
