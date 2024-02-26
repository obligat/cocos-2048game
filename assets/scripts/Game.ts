import { _decorator, Component, LabelComponent, Node, sys } from "cc";
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

  private userData: any = null;

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
    this.txtLv.string = `${level}x${level}`;
    this.txtScore.string = `${this.userData.score}`;
    this.txtBestScore.string = `${this.userData.bestScore}`;
    this.txtBack.string = `撤回(${this.userData.backNum})`;
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
